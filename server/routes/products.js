const express = require("express")
const { body, validationResult } = require("express-validator")
const { pool } = require("../config/database")
const { authenticateAdmin, authorizePermission } = require("../middleware/auth")

const router = express.Router()

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      dialColor,
      material,
      search,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query

    const offset = (page - 1) * limit

    const connection = await pool.getConnection()

    let query = `
      SELECT p.*, b.name as brand_name, c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `

    let countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `

    const params = []

    // Apply filters
    if (category) {
      query += ` AND c.slug = ?`
      countQuery += ` AND c.slug = ?`
      params.push(category)
    }

    if (brand) {
      query += ` AND b.slug = ?`
      countQuery += ` AND b.slug = ?`
      params.push(brand)
    }

    if (minPrice) {
      query += ` AND p.price >= ?`
      countQuery += ` AND p.price >= ?`
      params.push(Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      query += ` AND p.price <= ?`
      countQuery += ` AND p.price <= ?`
      params.push(Number.parseFloat(maxPrice))
    }

    if (dialColor) {
      query += ` AND p.dial_color = ?`
      countQuery += ` AND p.dial_color = ?`
      params.push(dialColor)
    }

    if (material) {
      query += ` AND p.case_material = ?`
      countQuery += ` AND p.case_material = ?`
      params.push(material)
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)`
      countQuery += ` AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)`
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam)
    }

    // Apply sorting
    const validSortFields = ["name", "price", "created_at"]
    const validSortOrders = ["ASC", "DESC"]

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`
    } else {
      query += ` ORDER BY p.created_at DESC`
    }

    query += ` LIMIT ? OFFSET ?`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const [products] = await connection.execute(query, params)
    const [totalResult] = await connection.execute(countQuery, params.slice(0, -2))

    connection.release()

    res.json({
      success: true,
      data: {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.short_description,
          price: Number.parseFloat(product.price),
          comparePrice: product.compare_price ? Number.parseFloat(product.compare_price) : null,
          brand: product.brand_name,
          category: product.category_name,
          image: product.primary_image,
          dialColor: product.dial_color,
          material: product.case_material,
          isSustainable: product.is_sustainable,
          isFeatured: product.is_featured,
          inStock: product.inventory_quantity > 0,
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
    console.error("Get products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    })
  }
})

// Get single product by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params

    const connection = await pool.getConnection()

    // Get product details
    const [products] = await connection.execute(
      `
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = TRUE
    `,
      [slug],
    )

    if (products.length === 0) {
      connection.release()
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const product = products[0]

    // Get product images
    const [images] = await connection.execute(
      "SELECT image_url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY sort_order",
      [product.id],
    )

    // Get product reviews
    const [reviews] = await connection.execute(
      `
      SELECT r.rating, r.title, r.comment, r.created_at,
             CONCAT(u.first_name, ' ', u.last_name) as reviewer_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT 10
    `,
      [product.id],
    )

    // Get average rating
    const [ratingResult] = await connection.execute(
      "SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ? AND is_approved = TRUE",
      [product.id],
    )

    connection.release()

    res.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.short_description,
          sku: product.sku,
          price: Number.parseFloat(product.price),
          comparePrice: product.compare_price ? Number.parseFloat(product.compare_price) : null,
          brand: product.brand_name,
          category: product.category_name,
          images: images.map((img) => ({
            url: img.image_url,
            alt: img.alt_text,
            isPrimary: img.is_primary,
          })),
          specifications: {
            material: product.material,
            dialColor: product.dial_color,
            caseMaterial: product.case_material,
            strapMaterial: product.strap_material,
            waterResistance: product.water_resistance,
            movementType: product.movement_type,
            warranty: product.warranty_period,
            weight: product.weight,
            dimensions: product.dimensions,
          },
          isSustainable: product.is_sustainable,
          isFeatured: product.is_featured,
          inStock: product.inventory_quantity > 0,
          stockQuantity: product.inventory_quantity,
          rating: {
            average: ratingResult[0].avg_rating ? Number.parseFloat(ratingResult[0].avg_rating) : 0,
            count: ratingResult[0].review_count,
          },
          reviews: reviews.map((review) => ({
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            reviewer: review.reviewer_name,
            date: review.created_at,
          })),
        },
      },
    })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    })
  }
})

// Get featured products
router.get("/featured/list", async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [products] = await connection.execute(`
      SELECT p.*, b.name as brand_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.is_featured = TRUE AND p.is_active = TRUE
      ORDER BY p.created_at DESC
      LIMIT 8
    `)

    connection.release()

    res.json({
      success: true,
      data: {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number.parseFloat(product.price),
          comparePrice: product.compare_price ? Number.parseFloat(product.compare_price) : null,
          brand: product.brand_name,
          image: product.primary_image,
          dialColor: product.dial_color,
          isSustainable: product.is_sustainable,
        })),
      },
    })
  } catch (error) {
    console.error("Get featured products error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured products",
    })
  }
})

// Get brands
router.get("/brands/list", async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [brands] = await connection.execute(
      "SELECT name, slug, logo_url FROM brands WHERE is_active = TRUE ORDER BY sort_order, name",
    )

    connection.release()

    res.json({
      success: true,
      data: { brands },
    })
  } catch (error) {
    console.error("Get brands error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    })
  }
})

// Get categories
router.get("/categories/list", async (req, res) => {
  try {
    const connection = await pool.getConnection()

    const [categories] = await connection.execute(
      "SELECT name, slug, image_url FROM categories WHERE is_active = TRUE ORDER BY sort_order, name",
    )

    connection.release()

    res.json({
      success: true,
      data: { categories },
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    })
  }
})

module.exports = router
