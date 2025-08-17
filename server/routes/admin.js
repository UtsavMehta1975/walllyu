const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const {
  generateToken,
  hashPassword,
  comparePassword,
  authenticateAdmin,
  authorizeAdmin,
  authorizePermission,
} = require("../middleware/auth")

const router = express.Router()

// Admin login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty().withMessage("Password is required")],
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

      const { email, password } = req.body

      const connection = await pool.getConnection()

      // Get admin with password
      const [admins] = await connection.execute(
        "SELECT id, email, password, first_name, last_name, role, permissions, is_active FROM admin_users WHERE email = ?",
        [email],
      )

      if (admins.length === 0) {
        connection.release()
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        })
      }

      const admin = admins[0]

      if (!admin.is_active) {
        connection.release()
        return res.status(401).json({
          success: false,
          message: "Admin account is deactivated",
        })
      }

      // Compare password
      const isValidPassword = await comparePassword(password, admin.password)

      if (!isValidPassword) {
        connection.release()
        return res.status(401).json({
          success: false,
          message: "Invalid admin credentials",
        })
      }

      // Update last login
      await connection.execute("UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?", [admin.id])

      connection.release()

      const token = generateToken({ adminId: admin.id, email: admin.email, role: admin.role })

      res.json({
        success: true,
        message: "Admin login successful",
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            name: `${admin.first_name} ${admin.last_name}`,
            role: admin.role,
            permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
          },
          token,
        },
      })
    } catch (error) {
      console.error("Admin login error:", error)
      res.status(500).json({
        success: false,
        message: "Admin login failed",
      })
    }
  },
)

// Get dashboard analytics
router.get("/dashboard", authenticateAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    // Get key metrics
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users WHERE is_active = TRUE")
    const [orderCount] = await connection.execute("SELECT COUNT(*) as count FROM orders")
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products WHERE is_active = TRUE")
    const [revenueResult] = await connection.execute(
      'SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"',
    )

    // Get recent orders
    const [recentOrders] = await connection.execute(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `)

    // Get monthly sales data
    const [monthlySales] = await connection.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE payment_status = 'paid' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `)

    connection.release()

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers: userCount[0].count,
          totalOrders: orderCount[0].count,
          totalProducts: productCount[0].count,
          totalRevenue: revenueResult[0].total || 0,
        },
        recentOrders: recentOrders.map((order) => ({
          id: order.order_number,
          customer: order.customer_name || "Guest",
          amount: Number.parseFloat(order.total_amount),
          status: order.status,
          date: order.created_at,
        })),
        monthlySales: monthlySales.map((item) => ({
          month: item.month,
          orders: item.orders,
          sales: Number.parseFloat(item.revenue),
        })),
      },
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
    })
  }
})

// Get all users (admin only)
router.get("/users", authenticateAdmin, authorizePermission("users"), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query
    const offset = (page - 1) * limit
    const searchParam = `%${search}%`

    const connection = await pool.getConnection()

    let query = `
      SELECT id, email, first_name, last_name, membership_tier, 
             is_verified, is_active, created_at
      FROM users
    `
    let countQuery = "SELECT COUNT(*) as total FROM users"
    let params = []

    if (search) {
      query += ` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`
      countQuery += ` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`
      params = [searchParam, searchParam, searchParam]
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [users] = await connection.execute(query, params)
    const [totalResult] = await connection.execute(countQuery, search ? params : [])

    connection.release()

    res.json({
      success: true,
      data: {
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          membershipTier: user.membership_tier,
          isVerified: user.is_verified,
          isActive: user.is_active,
          joinDate: user.created_at,
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
    console.error("Get users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
})

// Get all orders (admin only)
router.get("/orders", authenticateAdmin, authorizePermission("orders"), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "" } = req.query
    const offset = (page - 1) * limit
    const searchParam = `%${status}%`

    const connection = await pool.getConnection()

    let query = `
      SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status,
             o.created_at, CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `
    let countQuery = "SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id"
    let params = []

    if (status) {
      query += ` WHERE o.status = ?`
      countQuery += ` WHERE o.status = ?`
      params = [searchParam]
    }

    query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [orders] = await connection.execute(query, params)
    const [totalResult] = await connection.execute(countQuery, status ? params : [])

    connection.release()

    res.json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.order_number,
          customer: order.customer_name || "Guest",
          email: order.customer_email || order.email,
          amount: Number.parseFloat(order.total_amount),
          status: order.status,
          paymentStatus: order.payment_status,
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

// Update order status
router.put(
  "/orders/:orderId/status",
  authenticateAdmin,
  authorizePermission("orders"),
  [body("status").isIn(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"])],
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

      const { orderId } = req.params
      const { status, trackingNumber } = req.body

      const connection = await pool.getConnection()

      let updateQuery = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP"
      const params = [status]

      if (status === "shipped" && trackingNumber) {
        updateQuery += ", tracking_number = ?, shipped_at = CURRENT_TIMESTAMP"
        params.push(trackingNumber)
      }

      if (status === "delivered") {
        updateQuery += ", delivered_at = CURRENT_TIMESTAMP"
      }

      updateQuery += " WHERE order_number = ?"
      params.push(orderId)

      const [result] = await connection.execute(updateQuery, params)

      connection.release()

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        })
      }

      res.json({
        success: true,
        message: "Order status updated successfully",
      })
    } catch (error) {
      console.error("Update order status error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
      })
    }
  },
)

// Admin logout
router.post("/logout", authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Admin logged out successfully",
  })
})

module.exports = router
