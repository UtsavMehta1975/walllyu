const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { authenticateAdmin } = require("../middleware/auth")

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, req.body.folder || "general")
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Upload single file
router.post("/single", authenticateAdmin, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      })
    }

    const fileUrl = `/uploads/${req.body.folder || "general"}/${req.file.filename}`

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      message: "File upload failed",
    })
  }
})

// Upload multiple files
router.post("/multiple", authenticateAdmin, upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      })
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: `/uploads/${req.body.folder || "general"}/${file.filename}`,
    }))

    res.json({
      success: true,
      message: "Files uploaded successfully",
      data: { files },
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({
      success: false,
      message: "File upload failed",
    })
  }
})

// Delete file
router.delete("/:folder/:filename", authenticateAdmin, (req, res) => {
  try {
    const { folder, filename } = req.params
    const filePath = path.join(uploadsDir, folder, filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      })
    }

    fs.unlinkSync(filePath)

    res.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Delete file error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
    })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB",
      })
    }
  }

  res.status(400).json({
    success: false,
    message: error.message || "Upload failed",
  })
})

module.exports = router
