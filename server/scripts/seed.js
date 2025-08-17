const { pool } = require("../config/database")
const { hashPassword } = require("../middleware/auth")

const seedDatabase = async () => {
  const connection = await pool.getConnection()

  try {
    console.log("🌱 Seeding database with sample data...")

    // Create admin user
    const adminPassword = await hashPassword("admin123")
    await connection.execute(
      `
      INSERT IGNORE INTO admin_users (email, password, first_name, last_name, role, permissions) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        "admin@walnutstore.com",
        adminPassword,
        "Admin",
        "User",
        "super_admin",
        JSON.stringify(["products", "orders", "users", "analytics", "settings"]),
      ],
    )

    // Create sample brands
    const brands = [
      { name: "Tommy Hilfiger", slug: "tommy-hilfiger", description: "Classic American style with a modern twist" },
      { name: "Nike", slug: "nike", description: "Just Do It - Performance and style combined" },
      { name: "Jacob & Co.", slug: "jacob-co", description: "Luxury timepieces with exceptional craftsmanship" },
      { name: "Rolex", slug: "rolex", description: "A crown for every achievement" },
      { name: "Omega", slug: "omega", description: "Swiss luxury watchmaking since 1848" },
    ]

    for (const brand of brands) {
      await connection.execute(
        "INSERT IGNORE INTO brands (name, slug, description, is_active) VALUES (?, ?, ?, TRUE)",
        [brand.name, brand.slug, brand.description],
      )
    }

    // Create sample categories
    const categories = [
      { name: "Sport Watches", slug: "sport", description: "Built for active lifestyles" },
      { name: "Luxury Watches", slug: "luxury", description: "Premium timepieces for special occasions" },
      { name: "Casual Watches", slug: "casual", description: "Everyday elegance and comfort" },
      { name: "Dive Watches", slug: "dive", description: "Water-resistant professional diving watches" },
      { name: "Dress Watches", slug: "dress", description: "Sophisticated timepieces for formal occasions" },
    ]

    for (const category of categories) {
      await connection.execute(
        "INSERT IGNORE INTO categories (name, slug, description, is_active) VALUES (?, ?, ?, TRUE)",
        [category.name, category.slug, category.description],
      )
    }

    // Get brand and category IDs
    const [brandResults] = await connection.execute("SELECT id, slug FROM brands")
    const [categoryResults] = await connection.execute("SELECT id, slug FROM categories")

    const brandMap = {}
    brandResults.forEach((brand) => (brandMap[brand.slug] = brand.id))

    const categoryMap = {}
    categoryResults.forEach((category) => (categoryMap[category.slug] = category.id))

    // Create sample products
    const products = [
      {
        name: "Quantum Chronograph Elite",
        slug: "quantum-chronograph-elite",
        description:
          "A masterpiece of precision engineering featuring quantum-enhanced timekeeping technology with a sleek titanium case and sapphire crystal display.",
        short_description: "Quantum-enhanced chronograph with titanium case",
        sku: "QCE-001",
        brand_id: brandMap["jacob-co"],
        category_id: categoryMap["luxury"],
        price: 15999.0,
        compare_price: 18999.0,
        inventory_quantity: 5,
        material: "Titanium",
        dial_color: "Black",
        case_material: "Titanium",
        strap_material: "Leather",
        water_resistance: "100m",
        movement_type: "Automatic",
        warranty_period: "5 years",
        is_sustainable: true,
        is_featured: true,
      },
      {
        name: "Fusion Sport Master",
        slug: "fusion-sport-master",
        description:
          "Built for athletes and adventurers, this sport watch combines durability with cutting-edge fitness tracking capabilities.",
        short_description: "Professional sport watch with fitness tracking",
        sku: "FSM-002",
        brand_id: brandMap["nike"],
        category_id: categoryMap["sport"],
        price: 1899.0,
        inventory_quantity: 25,
        material: "Stainless Steel",
        dial_color: "Blue",
        case_material: "Stainless Steel",
        strap_material: "Silicone",
        water_resistance: "200m",
        movement_type: "Quartz",
        warranty_period: "2 years",
        is_featured: true,
      },
      {
        name: "Classic Heritage",
        slug: "classic-heritage",
        description: "Timeless elegance meets modern functionality in this heritage-inspired timepiece.",
        short_description: "Heritage-inspired classic watch",
        sku: "CH-003",
        brand_id: brandMap["tommy-hilfiger"],
        category_id: categoryMap["casual"],
        price: 899.0,
        compare_price: 1199.0,
        inventory_quantity: 40,
        material: "Stainless Steel",
        dial_color: "White",
        case_material: "Stainless Steel",
        strap_material: "Leather",
        water_resistance: "50m",
        movement_type: "Quartz",
        warranty_period: "2 years",
      },
      {
        name: "Deep Sea Explorer",
        slug: "deep-sea-explorer",
        description: "Professional diving watch engineered for extreme depths with uncompromising reliability.",
        short_description: "Professional diving watch for extreme depths",
        sku: "DSE-004",
        brand_id: brandMap["omega"],
        category_id: categoryMap["dive"],
        price: 3299.0,
        inventory_quantity: 15,
        material: "Ceramic",
        dial_color: "Black",
        case_material: "Ceramic",
        strap_material: "Rubber",
        water_resistance: "600m",
        movement_type: "Automatic",
        warranty_period: "3 years",
        is_sustainable: true,
      },
      {
        name: "Celestial Masterpiece",
        slug: "celestial-masterpiece",
        description: "An astronomical marvel featuring moon phase complications and celestial tracking capabilities.",
        short_description: "Astronomical watch with moon phase complications",
        sku: "CM-005",
        brand_id: brandMap["jacob-co"],
        category_id: categoryMap["luxury"],
        price: 25999.0,
        inventory_quantity: 3,
        material: "Rose Gold",
        dial_color: "Blue",
        case_material: "Rose Gold",
        strap_material: "Alligator",
        water_resistance: "30m",
        movement_type: "Manual",
        warranty_period: "5 years",
        is_featured: true,
      },
    ]

    for (const product of products) {
      const [result] = await connection.execute(
        `
        INSERT IGNORE INTO products (
          name, slug, description, short_description, sku, brand_id, category_id,
          price, compare_price, inventory_quantity, material, dial_color,
          case_material, strap_material, water_resistance, movement_type,
          warranty_period, is_sustainable, is_featured, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `,
        [
          product.name,
          product.slug,
          product.description,
          product.short_description,
          product.sku,
          product.brand_id,
          product.category_id,
          product.price,
          product.compare_price || null,
          product.inventory_quantity,
          product.material,
          product.dial_color,
          product.case_material,
          product.strap_material,
          product.water_resistance,
          product.movement_type,
          product.warranty_period,
          product.is_sustainable || false,
          product.is_featured || false,
        ],
      )

      // Add sample product image
      if (result.insertId) {
        await connection.execute(
          "INSERT IGNORE INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, TRUE)",
          [
            result.insertId,
            "/placeholder.svg?height=400&width=400&text=" + encodeURIComponent(product.name),
            product.name,
          ],
        )
      }
    }

    console.log("✅ Database seeded successfully")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("🎉 Database seeding completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error)
    process.exit(1)
  })
