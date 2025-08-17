const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "walnut-store-secret-key-2024"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    // Get user from database
    const connection = await pool.getConnection()
    const [users] = await connection.execute(
      "SELECT id, email, first_name, last_name, membership_tier, is_active FROM users WHERE id = ? AND is_active = TRUE",
      [decoded.userId],
    )
    connection.release()

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      })
    }

    req.user = users[0]
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin access token required",
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    // Get admin from database
    const connection = await pool.getConnection()
    const [admins] = await connection.execute(
      "SELECT id, email, first_name, last_name, role, permissions, is_active FROM admin_users WHERE id = ? AND is_active = TRUE",
      [decoded.adminId],
    )
    connection.release()

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      })
    }

    req.admin = admins[0]
    next()
  } catch (error) {
    console.error("Admin auth middleware error:", error)
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    })
  }
}

// Role-based authorization middleware
const authorizeAdmin = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      })
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      })
    }

    next()
  }
}

// Permission-based authorization middleware
const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      })
    }

    const permissions = req.admin.permissions ? JSON.parse(req.admin.permissions) : []

    if (!permissions.includes(requiredPermission) && req.admin.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: `Permission required: ${requiredPermission}`,
      })
    }

    next()
  }
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticateUser,
  authenticateAdmin,
  authorizeAdmin,
  authorizePermission,
}
