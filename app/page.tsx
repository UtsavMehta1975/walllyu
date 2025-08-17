"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { Search, ShoppingBag, User, Menu, Play, Star, ArrowRight, Eye, Heart } from "lucide-react"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { state: cartState, dispatch: cartDispatch } = useCart()
  const { state: authState } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-heading text-2xl font-black text-primary">
                THE WALNUT STORE
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/products" className="text-foreground hover:text-primary transition-colors">
                  Watches
                </Link>
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Brands
                </a>
                <a href="#" className="text-foreground hover:text-primary transition-colors">
                  Collections
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Link href={authState.isAuthenticated ? "/profile" : "/auth/login"}>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => cartDispatch({ type: "TOGGLE_CART" })}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>
              <Button className="md:hidden" variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/placeholder-l55kg.png')`,
          }}
        />
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4 animate-fade-in-up">
          <h1 className="font-heading text-5xl md:text-7xl font-black text-foreground mb-6 leading-tight">
            FUTURE OF
            <span className="block text-primary">ANALOG LUXURY</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium futuristic analog watches that blend traditional craftsmanship with cutting-edge design
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold premium-hover"
              >
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold premium-hover bg-transparent"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Craftsmanship
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6">
              Crafted for the Future
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Where traditional watchmaking meets futuristic design. Each timepiece tells a story of innovation,
              precision, and timeless elegance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="premium-hover animate-scale-in">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4">Premium Materials</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Crafted with the finest materials including titanium, ceramic, and sapphire crystal for unmatched
                  durability and elegance.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-hover animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4">Virtual Showcase</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Experience watches through high-resolution imagery and detailed specifications. Explore every detail
                  with our immersive product galleries.
                </p>
              </CardContent>
            </Card>

            <Card className="premium-hover animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4">Sustainable Luxury</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Committed to sustainable practices with eco-friendly packaging and ethically sourced materials for
                  conscious luxury.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Brands Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6">Premium Brands</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Curated collection from the world's most prestigious watchmakers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Tommy Hilfiger", "Nike", "Jacob & Co.", "Rolex"].map((brand, index) => (
              <Card
                key={brand}
                className="premium-hover animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className="h-20 bg-cover bg-center bg-no-repeat mb-4 rounded-lg"
                    style={{
                      backgroundImage: `url('/placeholder-o383p.png')`,
                    }}
                  />
                  <h3 className="font-heading text-lg font-bold">{brand}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-6">Featured Timepieces</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our most coveted watches, each a masterpiece of design and engineering
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Quantum Chronograph",
                brand: "Tommy Hilfiger",
                price: "$2,499",
                image: "luxury+chronograph+watch+with+blue+dial",
              },
              {
                name: "Fusion Sport Elite",
                brand: "Nike",
                price: "$1,899",
                image: "modern+sport+watch+with+titanium+case",
              },
              {
                name: "Celestial Master",
                brand: "Jacob & Co.",
                price: "$15,999",
                image: "premium+skeleton+watch+with+gold+accents",
              },
            ].map((watch, index) => (
              <Card
                key={watch.name}
                className="premium-hover animate-scale-in overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className="h-64 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('/elegant-gold-wristwatch.png')`,
                  }}
                />
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">
                    {watch.brand}
                  </Badge>
                  <h3 className="font-heading text-xl font-bold mb-2">{watch.name}</h3>
                  <p className="text-2xl font-bold text-primary mb-4">{watch.price}</p>
                  <div className="flex gap-2">
                    <Button className="flex-1 premium-hover">Add to Cart</Button>
                    <Button variant="outline" size="icon" className="premium-hover bg-transparent">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold premium-hover bg-transparent"
            >
              View All Watches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-heading text-2xl font-black mb-4">THE WALNUT STORE</div>
              <p className="text-background/80 leading-relaxed">
                Premium futuristic analog watches for the discerning collector.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    All Watches
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Collections
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Size Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Warranty
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Returns
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-background/80">
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/60">
            <p>&copy; 2024 The Walnut Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
