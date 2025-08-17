const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const { testConnection, initializeDatabase } = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const productRoutes = require("./routes/products")
const cartRoutes = require("./routes/cart")
const orderRoutes = require("./routes/orders")
const userRoutes = require("./routes/users")
const adminRoutes = require("./routes/admin")
const paymentRoutes = require("./routes/payments")
const uploadRoutes = require("./routes/upload")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Compression middleware
app.use(compression())

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
} else {
  app.use(morgan("combined"))
}

// Static file serving
app.use("/uploads", express.static("uploads"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "The Walnut Store API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/upload", uploadRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global Error:", error)

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
})

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase()

    // Test database connection
    const dbConnected = await testConnection()
    if (!dbConnected) {
      console.error("❌ Failed to connect to database. Exiting...")
      process.exit(1)
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 The Walnut Store API server running on port ${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV}`)
      console.log(`🔗 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  process.exit(0)
})

startServer()

module.exports = app
