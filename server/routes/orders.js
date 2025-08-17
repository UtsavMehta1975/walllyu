const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `WS${timestamp.slice(-6)}${random}`
}

// Create new order
router.post(
  "/",
  authenticateUser,
  [
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
    body("billingAddress").isObject().withMessage("Billing address is required"),
    body("shippingAddress").isObject().withMessage("Shipping address is required"),
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

      const { paymentMethod, billingAddress, shippingAddress, notes } = req.body

      const connection = await pool.getConnection()
      await connection.beginTransaction()

      try {
        // Get user's cart
        const [carts] = await connection.execute("SELECT id FROM carts WHERE user_id = ?", [req.user.id])

        if (carts.length === 0) {
          await connection.rollback()
          connection.release()
          return res.status(400).json({
            success: false,
            message: "Cart is empty",
          })
        }

        const cartId = carts[0].id

        // Get cart items
        const [cartItems] = await connection.execute(
          `
        SELECT ci.*, p.name, p.sku, p.inventory_quantity, p.track_inventory
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.cart_id = ? AND p.is_active = TRUE
      `,
          [cartId],
        )

        if (cartItems.length === 0) {
          await connection.rollback()
          connection.release()
          return res.status(400).json({
            success: false,
            message: "Cart is empty",
          })
        }

        // Check inventory for all items
        for (const item of cartItems) {
          if (item.track_inventory && item.inventory_quantity < item.quantity) {
            await connection.rollback()
            connection.release()
            return res.status(400).json({
              success: false,
              message: `Insufficient inventory for ${item.name}`,
            })
          }
        }

        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => sum + Number.parseFloat(item.price) * item.quantity, 0)
        const taxAmount = subtotal * 0.08 // 8% tax
        const shippingAmount = subtotal > 100 ? 0 : 15 // Free shipping over $100
        const totalAmount = subtotal + taxAmount + shippingAmount

        // Generate order number
        const orderNumber = generateOrderNumber()

        // Create order
        const [orderResult] = await connection.execute(
          `
        INSERT INTO orders (
          order_number, user_id, email, status, payment_status, payment_method,
          subtotal, tax_amount, shipping_amount, total_amount,
          billing_address, shipping_address, notes
        ) VALUES (?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
      `,
          [
            orderNumber,
            req.user.id,
            req.user.email,
            paymentMethod,
            subtotal,
            taxAmount,
            shippingAmount,
            totalAmount,
            JSON.stringify(billingAddress),
            JSON.stringify(shippingAddress),
            notes,
          ],
        )

        const orderId = orderResult.insertId

        // Create order items and update inventory
        for (const item of cartItems) {
          // Add order item
          await connection.execute(
            `
          INSERT INTO order_items (
            order_id, product_id, product_name, product_sku,
            quantity, price, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
            [
              orderId,
              item.product_id,
              item.name,
              item.sku,
              item.quantity,
              item.price,
              Number.parseFloat(item.price) * item.quantity,
            ],
          )

          // Update inventory
          if (item.track_inventory) {
            await connection.execute("UPDATE products SET inventory_quantity = inventory_quantity - ? WHERE id = ?", [
              item.quantity,
              item.product_id,
            ])
          }
        }

        // Clear cart
        await connection.execute("DELETE FROM cart_items WHERE cart_id = ?", [cartId])

        await connection.commit()
        connection.release()

        res.status(201).json({
          success: true,
          message: "Order created successfully",
          data: {
            order: {
              id: orderNumber,
              status: "pending",
              total: totalAmount,
              items: cartItems.length,
            },
          },
        })
      } catch (error) {
        await connection.rollback()
        connection.release()
        throw error
      }
    } catch (error) {
      console.error("Create order error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create order",
      })
    }
  },
)

// Get user's orders
router.get("/", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      `
      SELECT order_number, status, payment_status, total_amount, created_at
      FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
      [req.user.id, Number.parseInt(limit), Number.parseInt(offset)],
    )

    const [totalResult] = await connection.execute("SELECT COUNT(*) as total FROM orders WHERE user_id = ?", [
      req.user.id,
    ])

    connection.release()

    res.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          total: Number.parseFloat(order.total_amount),
          date: order.created_at,
        })),
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total: totalResult[0].total,
          pages: Math.ceil(totalResult[0].total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
})

// Get single order
router.get("/:orderNumber", authenticateUser, async (req, res) => {
  try {
    const { orderNumber } = req.params

    const connection = await pool.getConnection()

    // Get order details
    const [orders] = await connection.execute(
      `
      SELECT * FROM orders
      WHERE order_number = ? AND user_id = ?
    `,
      [orderNumber, req.user.id],
    )

    if (orders.length === 0) {
      connection.release()
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    const order = orders[0]

    // Get order items
    const [orderItems] = await connection.execute(
      `
      SELECT oi.*, p.slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `,
      [order.id],
    )

    connection.release()

    res.json({
      success: true,
      data: {
        order: {
          id: order.order_number,
          status: order.status,
          paymentStatus: order.payment_status,
          paymentMethod: order.payment_method,
          subtotal: Number.parseFloat(order.subtotal),
          taxAmount: Number.parseFloat(order.tax_amount),
          shippingAmount: Number.parseFloat(order.shipping_amount),
          total: Number.parseFloat(order.total_amount),
          billingAddress: JSON.parse(order.billing_address),
          shippingAddress: JSON.parse(order.shipping_address),
          trackingNumber: order.tracking_number,
          notes: order.notes,
          createdAt: order.created_at,
          shippedAt: order.shipped_at,
          deliveredAt: order.delivered_at,
          items: orderItems.map((item) => ({
            id: item.id,
            productId: item.product_id,
            name: item.product_name,
            sku: item.product_sku,
            slug: item.slug,
            quantity: item.quantity,
            price: Number.parseFloat(item.price),
            total: Number.parseFloat(item.total),
            image: item.image_url,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    })
  }
})

module.exports = router
