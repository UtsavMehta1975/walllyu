"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { CheckCircle, Package, Truck, Mail, ArrowRight, Download } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  const { dispatch } = useCart()

  useEffect(() => {
    // Clear cart after successful order
    dispatch({ type: "CLEAR_CART" })
  }, [dispatch])

  const orderNumber = "WS" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-heading text-4xl font-black text-foreground mb-4">Order Confirmed!</h1>
          <p className="text-xl text-muted-foreground mb-6">Thank you for your premium timepiece purchase</p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Order #{orderNumber}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h3 className="font-heading text-xl font-bold">Order Details</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Order Number</span>
                  <span className="font-medium">{orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium">Credit Card ****1234</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <span className="font-bold text-primary">$2,499.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <h3 className="font-heading text-xl font-bold">Shipping Info</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Shipping Method</span>
                  <span className="font-medium">Standard Shipping</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-medium">{estimatedDelivery}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tracking</span>
                  <span className="font-medium">Available in 24 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-heading text-xl font-bold mb-6">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Confirmation Email</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation with your order details
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Order Processing</h4>
                <p className="text-sm text-muted-foreground">Your order will be carefully prepared and packaged</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-2">Shipping Updates</h4>
                <p className="text-sm text-muted-foreground">Track your package with real-time shipping updates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="premium-hover">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline" size="lg" className="premium-hover bg-transparent">
            Track Your Order
          </Button>
          <Link href="/products">
            <Button variant="outline" size="lg" className="premium-hover bg-transparent">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
