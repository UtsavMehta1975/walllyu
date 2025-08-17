const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Get user's cart
router.get("/", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Get or create cart for user
    let [carts] = await connection.execute("SELECT id FROM carts WHERE user_id = ?", [req.user.id])

    if (carts.length === 0) {
      const [result] = await connection.execute("INSERT INTO carts (user_id) VALUES (?)", [req.user.id])
      carts = [{ id: result.insertId }]
    }

    const cartId = carts[0].id

    // Get cart items with product details
    const [cartItems] = await connection.execute(
      `
      SELECT ci.*, p.name, p.slug, p.price as current_price, p.inventory_quantity,
             b.name as brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ci.cart_id = ? AND p.is_active = TRUE
    `,
      [cartId],
    )

    const items = cartItems.map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      slug: item.slug,
      brand: item.brand_name,
      price: Number.parseFloat(item.price),
      currentPrice: Number.parseFloat(item.current_price),
      quantity: item.quantity,
      image: item.image_url,
      inStock: item.inventory_quantity > 0,
      total: Number.parseFloat(item.price) * item.quantity,
    }))

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)

    connection.release()

    res.json({
      success: true,
      data: {
        cart: {
          id: cartId,
          items,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal,
          total: subtotal, // Add tax/shipping calculation here if needed
        },
      },
    })
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    })
  }
})

// Add item to cart
router.post(
  "/items",
  authenticateUser,
  [
    body("productId").isInt({ min: 1 }).withMessage("Valid product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
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

      const { productId, quantity = 1 } = req.body

      const connection = await pool.getConnection()

      // Check if product exists and is active
      const [products] = await connection.execute(
        "SELECT id, name, price, inventory_quantity, track_inventory FROM products WHERE id = ? AND is_active = TRUE",
        [productId],
      )

      if (products.length === 0) {
        connection.release()
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      const product = products[0]

      // Check inventory
      if (product.track_inventory && product.inventory_quantity < quantity) {
        connection.release()
        return res.status(400).json({
          success: false,
          message: "Insufficient inventory",
        })
      }

      // Get or create cart
      let [carts] = await connection.execute("SELECT id FROM carts WHERE user_id = ?", [req.user.id])

      if (carts.length === 0) {
        const [result] = await connection.execute("INSERT INTO carts (user_id) VALUES (?)", [req.user.id])
        carts = [{ id: result.insertId }]
      }

      const cartId = carts[0].id

      // Check if item already exists in cart
      const [existingItems] = await connection.execute(
        "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
        [cartId, productId],
      )

      if (existingItems.length > 0) {
        // Update existing item
        const newQuantity = existingItems[0].quantity + quantity

        if (product.track_inventory && product.inventory_quantity < newQuantity) {
          connection.release()
          return res.status(400).json({
            success: false,
            message: "Insufficient inventory for requested quantity",
          })
        }

        await connection.execute("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
          newQuantity,
          existingItems[0].id,
        ])
      } else {
        // Add new item
        await connection.execute("INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)", [
          cartId,
          productId,
          quantity,
          product.price,
        ])
      }

      connection.release()

      res.json({
        success: true,
        message: "Item added to cart successfully",
      })
    } catch (error) {
      console.error("Add to cart error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
      })
    }
  },
)

// Update cart item quantity
router.put(
  "/items/:itemId",
  authenticateUser,
  [body("quantity").isInt({ min: 0 }).withMessage("Quantity must be 0 or greater")],
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

      const { itemId } = req.params
      const { quantity } = req.body

      const connection = await pool.getConnection()

      // Verify item belongs to user's cart
      const [cartItems] = await connection.execute(
        `
      SELECT ci.id, ci.product_id, p.inventory_quantity, p.track_inventory
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND c.user_id = ?
    `,
        [itemId, req.user.id],
      )

      if (cartItems.length === 0) {
        connection.release()
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        })
      }

      const item = cartItems[0]

      if (quantity === 0) {
        // Remove item from cart
        await connection.execute("DELETE FROM cart_items WHERE id = ?", [itemId])
      } else {
        // Check inventory
        if (item.track_inventory && item.inventory_quantity < quantity) {
          connection.release()
          return res.status(400).json({
            success: false,
            message: "Insufficient inventory",
          })
        }

        // Update quantity
        await connection.execute("UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
          quantity,
          itemId,
        ])
      }

      connection.release()

      res.json({
        success: true,
        message: quantity === 0 ? "Item removed from cart" : "Cart updated successfully",
      })
    } catch (error) {
      console.error("Update cart error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update cart",
      })
    }
  },
)

// Remove item from cart
router.delete("/items/:itemId", authenticateUser, async (req, res) => {
  try {
    const { itemId } = req.params

    const connection = await pool.getConnection()

    // Verify item belongs to user's cart and delete
    const [result] = await connection.execute(
      `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE ci.id = ? AND c.user_id = ?
    `,
      [itemId, req.user.id],
    )

    connection.release()

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      })
    }

    res.json({
      success: true,
      message: "Item removed from cart successfully",
    })
  } catch (error) {
    console.error("Remove from cart error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    })
  }
})

// Clear cart
router.delete("/", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    await connection.execute(
      `
      DELETE ci FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.id
      WHERE c.user_id = ?
    `,
      [req.user.id],
    )

    connection.release()

    res.json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error) {
    console.error("Clear cart error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    })
  }
})

module.exports = router
