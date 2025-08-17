const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Get user addresses
router.get("/addresses", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [addresses] = await connection.execute(
      "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [req.user.id],
    )

    connection.release()

    res.json({
      success: true,
      data: {
        addresses: addresses.map((addr) => ({
          id: addr.id,
          type: addr.type,
          firstName: addr.first_name,
          lastName: addr.last_name,
          company: addr.company,
          addressLine1: addr.address_line_1,
          addressLine2: addr.address_line_2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
          isDefault: addr.is_default,
        })),
      },
    })
  } catch (error) {
    console.error("Get addresses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    })
  }
})

// Add new address
router.post(
  "/addresses",
  authenticateUser,
  [
    body("type").isIn(["billing", "shipping"]).withMessage("Type must be billing or shipping"),
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("addressLine1").trim().notEmpty().withMessage("Address line 1 is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("state").trim().notEmpty().withMessage("State is required"),
    body("postalCode").trim().notEmpty().withMessage("Postal code is required"),
    body("country").trim().notEmpty().withMessage("Country is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const {
        type,
        firstName,
        lastName,
        company,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        isDefault,
      } = req.body

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // If this is set as default, unset other defaults of same type
        if (isDefault) {
          await connection.execute("UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND type = ?", [
            req.user.id,
            type,
          ])
        }

        // Insert new address
        const [result] = await connection.execute(
          `
        INSERT INTO user_addresses (
          user_id, type, first_name, last_name, company,
          address_line_1, address_line_2, city, state, postal_code, country, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            req.user.id,
            type,
            firstName,
            lastName,
            company,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault || false,
          ],
        )

        await connection.commit()
        connection.release()

        res.status(201).json({
          success: true,
          message: "Address added successfully",
          data: { addressId: result.insertId },
        })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error("Add address error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to add address",
      })
    }
  },
)

// Update address
router.put(
  "/addresses/:addressId",
  authenticateUser,
  [
    body("firstName").optional().trim().notEmpty(),
    body("lastName").optional().trim().notEmpty(),
    body("addressLine1").optional().trim().notEmpty(),
    body("city").optional().trim().notEmpty(),
    body("state").optional().trim().notEmpty(),
    body("postalCode").optional().trim().notEmpty(),
    body("country").optional().trim().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { addressId } = req.params
      const { firstName, lastName, company, addressLine1, addressLine2, city, state, postalCode, country, isDefault } =
        req.body

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Verify address belongs to user
        const [addresses] = await connection.execute("SELECT type FROM user_addresses WHERE id = ? AND user_id = ?", [
          addressId,
          req.user.id,
        ])

        if (addresses.length === 0) {
          await connection.rollback()
          connection.release()
          return res.status(404).json({
            success: false,
            message: "Address not found",
          })
        }

        // If setting as default, unset other defaults of same type
        if (isDefault) {
          await connection.execute(
            "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND type = ? AND id != ?",
            [req.user.id, addresses[0].type, addressId],
          )
        }

        // Update address
        await connection.execute(
          `
        UPDATE user_addresses SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          company = COALESCE(?, company),
          address_line_1 = COALESCE(?, address_line_1),
          address_line_2 = COALESCE(?, address_line_2),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          postal_code = COALESCE(?, postal_code),
          country = COALESCE(?, country),
          is_default = COALESCE(?, is_default),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `,
          [
            firstName,
            lastName,
            company,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            isDefault,
            addressId,
            req.user.id,
          ],
        )

        await connection.commit()
        connection.release()

        res.json({
          success: true,
          message: "Address updated successfully",
        })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error("Update address error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update address",
      })
    }
  },
)

// Delete address
router.delete("/addresses/:addressId", authenticateUser, async (req, res) => {
  try {
    const { addressId } = req.params

    const connection = await pool.getConnection()

    const [result] = await connection.execute("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [
      addressId,
      req.user.id,
    ])

    connection.release()

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      })
    }

    res.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Delete address error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
    })
  }
})

// Get user's wishlist
router.get("/wishlist", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [wishlistItems] = await connection.execute(
      `
      SELECT w.created_at, p.id, p.name, p.slug, p.price, p.compare_price,
             b.name as brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE w.user_id = ? AND p.is_active = TRUE
      ORDER BY w.created_at DESC
    `,
      [req.user.id],
    )

    connection.release()

    res.json({
      success: true,
      data: {
        wishlist: wishlistItems.map((item) => ({
          productId: item.id,
          name: item.name,
          slug: item.slug,
          brand: item.brand_name,
          price: Number.parseFloat(item.price),
          comparePrice: item.compare_price ? Number.parseFloat(item.compare_price) : null,
          image: item.image_url,
          addedAt: item.created_at,
        })),
      },
    })
  } catch (error) {
    console.error("Get wishlist error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    })
  }
})

// Add to wishlist
router.post(
  "/wishlist",
  authenticateUser,
  [body("productId").isInt({ min: 1 }).withMessage("Valid product ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { productId } = req.body

      const connection = await pool.getConnection()

      // Check if product exists
      const [products] = await connection.execute("SELECT id FROM products WHERE id = ? AND is_active = TRUE", [
        productId,
      ])

      if (products.length === 0) {
        connection.release()
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      // Add to wishlist (ignore if already exists)
      await connection.execute("INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)", [
        req.user.id,
        productId,
      ])

      connection.release()

      res.json({
        success: true,
        message: "Product added to wishlist",
      })
    } catch (error) {
      console.error("Add to wishlist error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to add to wishlist",
      })
    }
  },
)

// Remove from wishlist
router.delete("/wishlist/:productId", authenticateUser, async (req, res) => {
  try {
    const { productId } = req.params

    const connection = await pool.getConnection()

    const [result] = await connection.execute("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?", [
      req.user.id,
      productId,
    ])

    connection.release()

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      })
    }

    res.json({
      success: true,
      message: "Product removed from wishlist",
    })
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
    })
  }
})

module.exports = router
