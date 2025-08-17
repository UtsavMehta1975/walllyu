const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { generateToken, hashPassword, comparePassword, authenticateUser } = require("../middleware/auth")

const router = express.Router()

// Register new user
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("firstName").trim().isLength({ min: 1 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 1 }).withMessage("Last name is required"),
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

      const { email, password, firstName, lastName, phone } = req.body

      const connection = await pool.getConnection()

      // Check if user already exists
      const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

      if (existingUsers.length > 0) {
        connection.release()
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        })
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create user
      const [result] = await connection.execute(
        "INSERT INTO users (email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)",
        [email, hashedPassword, firstName, lastName, phone || null],
      )

      // Get created user
      const [users] = await connection.execute(
        "SELECT id, email, first_name, last_name, membership_tier, created_at FROM users WHERE id = ?",
        [result.insertId],
      )

      connection.release()

      const user = users[0]
      const token = generateToken({ userId: user.id, email: user.email })

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            membershipTier: user.membership_tier,
            joinDate: user.created_at,
          },
          token,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Registration failed",
      })
    }
  },
)

// Login user
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

      // Get user with password
      const [users] = await connection.execute(
        "SELECT id, email, password, first_name, last_name, membership_tier, is_active, created_at FROM users WHERE email = ?",
        [email],
      )

      connection.release()

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      const user = users[0]

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated",
        })
      }

      // Compare password
      const isValidPassword = await comparePassword(password, user.password)

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      const token = generateToken({ userId: user.id, email: user.email })

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            membershipTier: user.membership_tier,
            joinDate: user.created_at,
          },
          token,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Login failed",
      })
    }
  },
)

// Get current user profile
router.get("/profile", authenticateUser, async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [users] = await connection.execute(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, 
       membership_tier, is_verified, created_at 
       FROM users WHERE id = ?`,
      [req.user.id],
    )

    connection.release()

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const user = users[0]

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          membershipTier: user.membership_tier,
          isVerified: user.is_verified,
          joinDate: user.created_at,
        },
      },
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    })
  }
})

// Update user profile
router.put(
  "/profile",
  authenticateUser,
  [
    body("firstName").optional().trim().isLength({ min: 1 }),
    body("lastName").optional().trim().isLength({ min: 1 }),
    body("phone").optional().isMobilePhone(),
    body("dateOfBirth").optional().isISO8601(),
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

      const { firstName, lastName, phone, dateOfBirth } = req.body

      const connection = await pool.getConnection()

      await connection.execute(
        `UPDATE users SET 
       first_name = COALESCE(?, first_name),
       last_name = COALESCE(?, last_name),
       phone = COALESCE(?, phone),
       date_of_birth = COALESCE(?, date_of_birth),
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
        [firstName, lastName, phone, dateOfBirth, req.user.id],
      )

      connection.release()

      res.json({
        success: true,
        message: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      })
    }
  },
)

// Change password
router.put(
  "/change-password",
  authenticateUser,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body

      const connection = await pool.getConnection()

      // Get current password
      const [users] = await connection.execute("SELECT password FROM users WHERE id = ?", [req.user.id])

      if (users.length === 0) {
        connection.release()
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Verify current password
      const isValidPassword = await comparePassword(currentPassword, users[0].password)

      if (!isValidPassword) {
        connection.release()
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)

      // Update password
      await connection.execute("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
        hashedNewPassword,
        req.user.id,
      ])

      connection.release()

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Password change error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      })
    }
  },
)

// Logout (client-side token invalidation)
router.post("/logout", authenticateUser, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

module.exports = router
