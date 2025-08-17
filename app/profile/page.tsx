"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, User, Settings, Crown, Star, Calendar, Edit, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock order data
const mockOrders = [
  {
    id: "WS123456789",
    date: "2024-01-15",
    status: "delivered",
    total: 2499,
    items: [
      {
        name: "Quantum Chronograph Elite",
        brand: "Tommy Hilfiger",
        image: "luxury+chronograph+watch+with+blue+dial",
        price: 2499,
      },
    ],
  },
  {
    id: "WS987654321",
    date: "2024-01-08",
    status: "shipped",
    total: 1899,
    items: [
      {
        name: "Fusion Sport Master",
        brand: "Nike",
        image: "modern+sport+watch+with+titanium+case",
        price: 1899,
      },
    ],
  },
  {
    id: "WS456789123",
    date: "2023-12-20",
    status: "delivered",
    total: 15999,
    items: [
      {
        name: "Celestial Masterpiece",
        brand: "Jacob & Co.",
        image: "premium+skeleton+watch+with+gold+accents",
        price: 15999,
      },
    ],
  },
]

export default function ProfilePage() {
  const { state, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/auth/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!state.user) {
    return null
  }

  const getMembershipBadge = (tier: string) => {
    switch (tier) {
      case "elite":
        return (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">
            <Crown className="h-3 w-3 mr-1" />
            Elite
          </Badge>
        )
      case "premium":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-blue-700">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      default:
        return <Badge variant="secondary">Standard</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Shipped</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <Button variant="outline" onClick={handleLogout} className="premium-hover bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="premium-hover">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  {state.user.avatar ? (
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url('${state.user.avatar}')` }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
                      {state.user.firstName.charAt(0)}
                      {state.user.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <h2 className="font-heading text-xl font-bold mb-2">
                  {state.user.firstName} {state.user.lastName}
                </h2>
                <p className="text-muted-foreground text-sm mb-3">{state.user.email}</p>
                {getMembershipBadge(state.user.membershipTier)}

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(state.user.joinDate).getFullYear()}
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4 premium-hover bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Membership Benefits */}
            <Card className="mt-6 premium-hover">
              <CardHeader>
                <CardTitle className="text-lg">Membership Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Extended warranty coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Priority customer support</span>
                </div>
                {state.user.membershipTier !== "standard" && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Exclusive product access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Personal shopping assistant</span>
                    </div>
                  </>
                )}
                {state.user.membershipTier === "elite" && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>VIP events & experiences</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="orders">Order History</TabsTrigger>
                <TabsTrigger value="settings">Account Settings</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading text-2xl font-bold">Order History</h3>
                    <p className="text-muted-foreground">{mockOrders.length} orders</p>
                  </div>

                  <div className="space-y-4">
                    {mockOrders.map((order) => (
                      <Card key={order.id} className="premium-hover">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium">Order #{order.id}</h4>
                              <p className="text-sm text-muted-foreground">
                                Placed on {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="font-bold text-primary mt-1">${order.total.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex gap-4">
                                <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                  <div
                                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                                    style={{
                                      backgroundImage: `url('/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.image)}')`,
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <Badge variant="secondary" className="text-xs mb-1">
                                    {item.brand}
                                  </Badge>
                                  <h5 className="font-medium text-sm">{item.name}</h5>
                                  <p className="text-sm text-primary font-bold">${item.price.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="premium-hover bg-transparent">
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm" className="premium-hover bg-transparent">
                                Reorder
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button variant="outline" size="sm" className="premium-hover bg-transparent">
                                Track Package
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-heading text-2xl font-bold">Account Settings</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="premium-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <p className="text-muted-foreground">
                            {state.user.firstName} {state.user.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-muted-foreground">{state.user.email}</p>
                        </div>
                        <Button variant="outline" className="w-full premium-hover bg-transparent">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Information
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="premium-hover">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Currency</label>
                          <p className="text-muted-foreground">{state.user.preferences.currency}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Language</label>
                          <p className="text-muted-foreground">English</p>
                        </div>
                        <Button variant="outline" className="w-full premium-hover bg-transparent">
                          <Settings className="h-4 w-4 mr-2" />
                          Update Preferences
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="membership" className="mt-6">
                <div className="space-y-6">
                  <h3 className="font-heading text-2xl font-bold">Membership</h3>

                  <Card className="premium-hover">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="font-heading text-xl font-bold mb-2">Current Plan</h4>
                          {getMembershipBadge(state.user.membershipTier)}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {state.user.membershipTier === "elite"
                              ? "$299"
                              : state.user.membershipTier === "premium"
                                ? "$99"
                                : "Free"}
                          </p>
                          <p className="text-sm text-muted-foreground">per year</p>
                        </div>
                      </div>

                      {state.user.membershipTier === "standard" && (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <Card className="border-2 border-blue-200">
                              <CardContent className="p-4 text-center">
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-700 mb-3">
                                  <Star className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                                <p className="text-2xl font-bold mb-2">$99/year</p>
                                <ul className="text-sm space-y-1 mb-4">
                                  <li>• Exclusive product access</li>
                                  <li>• Personal shopping assistant</li>
                                  <li>• Priority support</li>
                                </ul>
                                <Button className="w-full premium-hover">Upgrade to Premium</Button>
                              </CardContent>
                            </Card>

                            <Card className="border-2 border-yellow-200">
                              <CardContent className="p-4 text-center">
                                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black mb-3">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Elite
                                </Badge>
                                <p className="text-2xl font-bold mb-2">$299/year</p>
                                <ul className="text-sm space-y-1 mb-4">
                                  <li>• All Premium benefits</li>
                                  <li>• VIP events & experiences</li>
                                  <li>• Concierge service</li>
                                </ul>
                                <Button className="w-full premium-hover">Upgrade to Elite</Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
