"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart-context"
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  Smartphone,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Leaf,
  Play,
  Minus,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

// Mock product data (in real app, this would come from API/database)
const productData = {
  1: {
    id: 1,
    name: "Quantum Chronograph Elite",
    brand: "Tommy Hilfiger",
    price: 2499,
    originalPrice: 2999,
    images: [
      "luxury+chronograph+watch+with+blue+dial",
      "watch+side+view+titanium+case",
      "watch+back+view+with+engravings",
      "watch+on+wrist+lifestyle+shot",
    ],
    dialColor: "Blue",
    material: "Titanium",
    size: "42mm",
    sustainable: true,
    rating: 4.8,
    reviews: 124,
    features: ["Water Resistant", "Sapphire Crystal", "Swiss Movement"],
    category: "Sport",
    description:
      "The Quantum Chronograph Elite represents the pinnacle of modern watchmaking, combining traditional craftsmanship with futuristic design elements. This exceptional timepiece features a stunning blue dial with luminous markers and a precision Swiss movement.",
    specifications: {
      "Case Material": "Grade 5 Titanium",
      "Case Diameter": "42mm",
      "Case Thickness": "12mm",
      "Water Resistance": "300m",
      Movement: "Swiss Automatic",
      Crystal: "Sapphire with AR coating",
      Strap: "Titanium bracelet",
      Warranty: "5 years international",
    },
    inStock: true,
    stockCount: 12,
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)
  const product = productData[productId as keyof typeof productData]
  const { dispatch } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const addToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images[0],
            size: product.size,
            material: product.material,
            dialColor: product.dialColor,
          },
        })
      }
      dispatch({ type: "OPEN_CART" })
    }
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/products">
            <Button variant="ghost" size="sm">
              Products
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('/placeholder.svg?height=600&width=600&text=${encodeURIComponent(product.images[selectedImage])}')`,
                }}
              />
              {product.originalPrice && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  Save ${(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              )}
              {product.sustainable && (
                <Badge className="absolute top-4 right-4 bg-green-600 text-white">
                  <Leaf className="h-4 w-4 mr-1" />
                  Sustainable
                </Badge>
              )}

              {/* AR Try-On Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <Button className="w-full bg-primary/90 hover:bg-primary text-primary-foreground backdrop-blur-sm">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Try On with AR
                </Button>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('/placeholder.svg?height=150&width=150&text=${encodeURIComponent(image)}')`,
                    }}
                  />
                </button>
              ))}
            </div>

            {/* 360° View Button */}
            <Button variant="outline" className="w-full bg-transparent">
              <Play className="h-4 w-4 mr-2" />
              360° Product View
            </Button>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.brand}
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">({product.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {/* Key Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="outline">{product.dialColor} Dial</Badge>
                <Badge variant="outline">{product.material}</Badge>
                <Badge variant="outline">{product.size}</Badge>
                {product.features.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    disabled={quantity >= product.stockCount}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stockCount} in stock</span>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 premium-hover" onClick={addToCart}>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`premium-hover ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="lg" className="premium-hover bg-transparent">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <Button variant="outline" size="lg" className="w-full premium-hover bg-transparent">
                <Smartphone className="h-5 w-5 mr-2" />
                Virtual Try-On Experience
              </Button>
            </div>

            {/* Shipping & Returns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">Orders over $1000</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">30-Day Returns</div>
                  <div className="text-xs text-muted-foreground">Hassle-free returns</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium text-sm">5-Year Warranty</div>
                  <div className="text-xs text-muted-foreground">International coverage</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/50">
                        <span className="font-medium">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <h3 className="font-heading text-xl font-bold mb-2">Customer Reviews</h3>
                    <p className="text-muted-foreground">Reviews feature coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl font-bold">Shipping Information</h3>
                    <p className="text-muted-foreground">
                      Free shipping on orders over $1000. Standard delivery takes 3-5 business days. Express shipping
                      available for next-day delivery.
                    </p>
                    <h3 className="font-heading text-xl font-bold">Returns Policy</h3>
                    <p className="text-muted-foreground">
                      30-day hassle-free returns. Items must be in original condition with all packaging.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="warranty" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-heading text-xl font-bold">5-Year International Warranty</h3>
                    <p className="text-muted-foreground">
                      Comprehensive warranty covering manufacturing defects and movement issues. Worldwide service
                      network for repairs and maintenance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
