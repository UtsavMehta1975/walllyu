const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Process payment (mock implementation)
router.post(
  "/process",
  authenticateUser,
  [
    body("orderNumber").notEmpty().withMessage("Order number is required"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
    body("amount").isFloat({ min: 0.01 }).withMessage("Valid amount is required"),
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

      const { orderNumber, paymentMethod, amount, paymentDetails } = req.body

      const connection = await pool.getConnection()

      // Get order
      const [orders] = await connection.execute(
        "SELECT id, total_amount, payment_status FROM orders WHERE order_number = ? AND user_id = ?",
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

      if (order.payment_status === "paid") {
        connection.release()
        return res.status(400).json({
          success: false,
          message: "Order already paid",
        })
      }

      if (Math.abs(Number.parseFloat(order.total_amount) - Number.parseFloat(amount)) > 0.01) {
        connection.release()
        return res.status(400).json({
          success: false,
          message: "Payment amount mismatch",
        })
      }

      // Mock payment processing
      const isPaymentSuccessful = Math.random() > 0.1 // 90% success rate for demo
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

      if (isPaymentSuccessful) {
        // Update order payment status
        await connection.execute(
          'UPDATE orders SET payment_status = "paid", payment_id = ?, status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [paymentId, order.id],
        )

        connection.release()

        res.json({
          success: true,
          message: "Payment processed successfully",
          data: {
            paymentId,
            status: "paid",
            orderNumber,
          },
        })
      } else {
        // Update order payment status to failed
        await connection.execute(
          'UPDATE orders SET payment_status = "failed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [order.id],
        )

        connection.release()

        res.status(400).json({
          success: false,
          message: "Payment processing failed",
          data: {
            status: "failed",
            orderNumber,
          },
        })
      }
    } catch (error) {
      console.error("Process payment error:", error)
      res.status(500).json({
        success: false,
        message: "Payment processing failed",
      })
    }
  },
)

// Get payment methods
router.get("/methods", (req, res) => {
  res.json({
    success: true,
    data: {
      methods: [
        {
          id: "credit_card",
          name: "Credit/Debit Card",
          description: "Visa, Mastercard, American Express",
          icon: "credit-card",
          enabled: true,
        },
        {
          id: "paypal",
          name: "PayPal",
          description: "Pay with your PayPal account",
          icon: "paypal",
          enabled: true,
        },
        {
          id: "apple_pay",
          name: "Apple Pay",
          description: "Pay with Touch ID or Face ID",
          icon: "apple",
          enabled: true,
        },
        {
          id: "google_pay",
          name: "Google Pay",
          description: "Pay with Google Pay",
          icon: "google",
          enabled: true,
        },
        {
          id: "upi",
          name: "UPI",
          description: "Pay using UPI ID",
          icon: "smartphone",
          enabled: true,
        },
        {
          id: "bnpl",
          name: "Buy Now Pay Later",
          description: "Split your payment into installments",
          icon: "calendar",
          enabled: true,
        },
      ],
    },
  })
})

// Verify payment status
router.get("/verify/:paymentId", authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params

    const connection = await pool.getConnection()

    const [orders] = await connection.execute(
      "SELECT order_number, payment_status, total_amount FROM orders WHERE payment_id = ? AND user_id = ?",
      [paymentId, req.user.id],
    )

    connection.release()

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    const order = orders[0]

    res.json({
      success: true,
      data: {
        paymentId,
        orderNumber: order.order_number,
        status: order.payment_status,
        amount: Number.parseFloat(order.total_amount),
      },
    })
  } catch (error) {
    console.error("Verify payment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    })
  }
})

module.exports = router
