"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Grid3x3, List, Heart, Eye, ShoppingBag, Star, Leaf, Smartphone, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock product data with premium watch specifications
const products = [
  {
    id: 1,
    name: "Quantum Chronograph Elite",
    brand: "Tommy Hilfiger",
    price: 2499,
    originalPrice: 2999,
    image: "luxury+chronograph+watch+with+blue+dial",
    dialColor: "Blue",
    material: "Titanium",
    size: "42mm",
    sustainable: true,
    rating: 4.8,
    reviews: 124,
    features: ["Water Resistant", "Sapphire Crystal", "Swiss Movement"],
    category: "Sport",
  },
  {
    id: 2,
    name: "Fusion Sport Master",
    brand: "Nike",
    price: 1899,
    originalPrice: null,
    image: "modern+sport+watch+with+titanium+case",
    dialColor: "Black",
    material: "Carbon Fiber",
    size: "44mm",
    sustainable: false,
    rating: 4.6,
    reviews: 89,
    features: ["Shock Resistant", "Luminous Hands", "Chronograph"],
    category: "Sport",
  },
  {
    id: 3,
    name: "Celestial Masterpiece",
    brand: "Jacob & Co.",
    price: 15999,
    originalPrice: null,
    image: "premium+skeleton+watch+with+gold+accents",
    dialColor: "Gold",
    material: "18K Gold",
    size: "40mm",
    sustainable: true,
    rating: 4.9,
    reviews: 67,
    features: ["Skeleton Design", "Hand Engraved", "Limited Edition"],
    category: "Luxury",
  },
  {
    id: 4,
    name: "Urban Explorer",
    brand: "Tommy Hilfiger",
    price: 899,
    originalPrice: 1199,
    image: "casual+watch+with+leather+strap",
    dialColor: "White",
    material: "Stainless Steel",
    size: "38mm",
    sustainable: true,
    rating: 4.4,
    reviews: 203,
    features: ["Date Display", "Leather Strap", "Water Resistant"],
    category: "Casual",
  },
  {
    id: 5,
    name: "Precision Diver",
    brand: "Nike",
    price: 3299,
    originalPrice: null,
    image: "diving+watch+with+rotating+bezel",
    dialColor: "Green",
    material: "Ceramic",
    size: "45mm",
    sustainable: false,
    rating: 4.7,
    reviews: 156,
    features: ["300m Water Resistant", "Rotating Bezel", "Helium Escape Valve"],
    category: "Dive",
  },
  {
    id: 6,
    name: "Heritage Classic",
    brand: "Jacob & Co.",
    price: 8999,
    originalPrice: null,
    image: "vintage+inspired+watch+with+roman+numerals",
    dialColor: "Silver",
    material: "Platinum",
    size: "39mm",
    sustainable: true,
    rating: 4.8,
    reviews: 91,
    features: ["Roman Numerals", "Manual Wind", "Vintage Inspired"],
    category: "Dress",
  },
]

const brands = ["All Brands", "Tommy Hilfiger", "Nike", "Jacob & Co."]
const dialColors = ["All Colors", "Blue", "Black", "Gold", "White", "Green", "Silver"]
const materials = ["All Materials", "Titanium", "Carbon Fiber", "18K Gold", "Stainless Steel", "Ceramic", "Platinum"]
const categories = ["All Categories", "Sport", "Luxury", "Casual", "Dive", "Dress"]

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBrand, setSelectedBrand] = useState("All Brands")
  const [selectedDialColor, setSelectedDialColor] = useState("All Colors")
  const [selectedMaterial, setSelectedMaterial] = useState("All Materials")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [showSustainable, setShowSustainable] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBrand = selectedBrand === "All Brands" || product.brand === selectedBrand
      const matchesDialColor = selectedDialColor === "All Colors" || product.dialColor === selectedDialColor
      const matchesMaterial = selectedMaterial === "All Materials" || product.material === selectedMaterial
      const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesSustainable = !showSustainable || product.sustainable

      return (
        matchesSearch &&
        matchesBrand &&
        matchesDialColor &&
        matchesMaterial &&
        matchesCategory &&
        matchesPrice &&
        matchesSustainable
      )
    })

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => b.id - a.id)
        break
      default:
        // Keep original order for "featured"
        break
    }

    setFilteredProducts(filtered)
  }, [
    searchTerm,
    selectedBrand,
    selectedDialColor,
    selectedMaterial,
    selectedCategory,
    priceRange,
    showSustainable,
    sortBy,
  ])

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Brand</h3>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Dial Color</h3>
        <div className="grid grid-cols-3 gap-2">
          {dialColors.map((color) => (
            <Button
              key={color}
              variant={selectedDialColor === color ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDialColor(color)}
              className="text-xs"
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Material</h3>
        <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {materials.map((material) => (
              <SelectItem key={material} value={material}>
                {material}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Category</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} max={20000} min={0} step={100} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <Button
          variant={showSustainable ? "default" : "outline"}
          onClick={() => setShowSustainable(!showSustainable)}
          className="w-full"
        >
          <Leaf className="mr-2 h-4 w-4" />
          Sustainable Only
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-4">
            Premium Watch Collection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover our curated selection of futuristic analog timepieces from the world's finest brands
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="font-heading text-xl font-bold mb-6">Filters</h2>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search watches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your search to find the perfect timepiece</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} watches
              </p>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className="premium-hover overflow-hidden">
                  <div className={viewMode === "list" ? "flex" : ""}>
                    <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : "h-64"}`}>
                      <div
                        className="w-full h-full bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url('/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.image)}')`,
                        }}
                      />
                      {product.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">Sale</Badge>
                      )}
                      {product.sustainable && (
                        <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                          <Leaf className="h-3 w-3 mr-1" />
                          Eco
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-white text-black hover:bg-white/90">
                            <Eye className="h-4 w-4 mr-1" />
                            Quick View
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                            <Smartphone className="h-4 w-4 mr-1" />
                            AR Try-On
                          </Button>
                        </div>
                      </div>
                    </div>

                    <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{product.brand}</Badge>
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>

                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-heading text-lg font-bold mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium ml-1">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {product.dialColor}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.material}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.size}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 premium-hover">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                        <Button variant="outline" className="premium-hover bg-transparent">
                          <Smartphone className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="font-heading text-xl font-bold mb-2">No watches found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedBrand("All Brands")
                    setSelectedDialColor("All Colors")
                    setSelectedMaterial("All Materials")
                    setSelectedCategory("All Categories")
                    setPriceRange([0, 20000])
                    setShowSustainable(false)
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
