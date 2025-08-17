"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import { ArrowLeft, CreditCard, Smartphone, Wallet, Shield, Truck, Gift, Leaf } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [giftWrap, setGiftWrap] = useState(false)
  const [sustainablePackaging, setSustainablePackaging] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const shippingCost = shippingMethod === "express" ? 25 : shippingMethod === "overnight" ? 50 : 0
  const giftWrapCost = giftWrap ? 15 : 0
  const subtotal = state.total
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shippingCost + giftWrapCost + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push("/checkout/confirmation")
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-3xl font-black text-foreground mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your premium timepiece purchase</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ca">California</SelectItem>
                          <SelectItem value="ny">New York</SelectItem>
                          <SelectItem value="tx">Texas</SelectItem>
                          <SelectItem value="fl">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" required />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select defaultValue="us" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Standard Shipping</p>
                            <p className="text-sm text-muted-foreground">5-7 business days</p>
                          </div>
                          <p className="font-medium">Free</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="express" id="express" />
                      <Label htmlFor="express" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Express Shipping</p>
                            <p className="text-sm text-muted-foreground">2-3 business days</p>
                          </div>
                          <p className="font-medium">$25</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="overnight" id="overnight" />
                      <Label htmlFor="overnight" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Overnight Shipping</p>
                            <p className="text-sm text-muted-foreground">Next business day</p>
                          </div>
                          <p className="font-medium">$50</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Special Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="giftWrap" checked={giftWrap} onCheckedChange={setGiftWrap} />
                    <Label htmlFor="giftWrap" className="flex items-center gap-2 cursor-pointer">
                      <Gift className="h-4 w-4" />
                      Premium Gift Wrapping (+$15)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sustainable"
                      checked={sustainablePackaging}
                      onCheckedChange={setSustainablePackaging}
                    />
                    <Label htmlFor="sustainable" className="flex items-center gap-2 cursor-pointer">
                      <Leaf className="h-4 w-4" />
                      Sustainable Packaging (Recommended)
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                        <Wallet className="h-4 w-4" />
                        PayPal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="apple" id="apple" />
                      <Label htmlFor="apple" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        Apple Pay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="google" id="google" />
                      <Label htmlFor="google" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        Google Pay
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        UPI Payment
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="bnpl" id="bnpl" />
                      <Label htmlFor="bnpl" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        Buy Now, Pay Later
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input id="cardName" required />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full premium-hover" disabled={isProcessing}>
                {isProcessing ? (
                  "Processing Payment..."
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Complete Secure Purchase - ${total.toLocaleString()}
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <div
                          className="w-full h-full bg-cover bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url('/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.image)}')`,
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-1">
                          {item.brand}
                        </Badge>
                        <h4 className="font-medium text-sm leading-tight mb-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Qty: {item.quantity} • {item.size}
                        </p>
                        <p className="font-bold text-primary">${(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? "Free" : `$${shippingCost}`}</span>
                  </div>
                  {giftWrap && (
                    <div className="flex justify-between">
                      <span>Gift Wrapping</span>
                      <span>${giftWrapCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-heading text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
