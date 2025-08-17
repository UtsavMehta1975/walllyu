"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

export function CartDrawer() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  return (
    <Sheet open={state.isOpen} onOpenChange={() => dispatch({ type: "TOGGLE_CART" })}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({state.itemCount})
          </SheetTitle>
          <SheetDescription>Review your selected timepieces</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-lg font-bold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">Add some premium timepieces to get started</p>
                <Button onClick={() => dispatch({ type: "CLOSE_CART" })}>Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-6">
                <div className="space-y-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <div
                          className="w-full h-full bg-cover bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url('/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.image)}')`,
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant="secondary" className="text-xs mb-1">
                              {item.brand}
                            </Badge>
                            <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                            {item.size && (
                              <p className="text-xs text-muted-foreground">
                                {item.size} • {item.material}
                              </p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-primary">${(item.price * item.quantity).toLocaleString()}</p>
                            {item.originalPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                ${(item.originalPrice * item.quantity).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-lg font-bold">Total</span>
                  <span className="font-heading text-2xl font-bold text-primary">${state.total.toLocaleString()}</span>
                </div>

                <div className="space-y-2">
                  <Link href="/checkout" onClick={() => dispatch({ type: "CLOSE_CART" })}>
                    <Button className="w-full premium-hover" size="lg">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => dispatch({ type: "CLOSE_CART" })}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
