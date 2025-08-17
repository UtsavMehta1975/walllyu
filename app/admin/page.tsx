"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdmin } from "@/lib/admin-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Mock data for dashboard
const salesData = [
  { month: "Jan", sales: 45000, orders: 120 },
  { month: "Feb", sales: 52000, orders: 140 },
  { month: "Mar", sales: 48000, orders: 130 },
  { month: "Apr", sales: 61000, orders: 165 },
  { month: "May", sales: 55000, orders: 150 },
  { month: "Jun", sales: 67000, orders: 180 },
]

const categoryData = [
  { name: "Sport", value: 35, color: "#0891b2" },
  { name: "Luxury", value: 25, color: "#f59e0b" },
  { name: "Casual", value: 20, color: "#10b981" },
  { name: "Dive", value: 12, color: "#8b5cf6" },
  { name: "Dress", value: 8, color: "#f97316" },
]

const recentOrders = [
  { id: "WS123456789", customer: "John Doe", amount: 2499, status: "processing", date: "2024-01-20" },
  { id: "WS987654321", customer: "Jane Smith", amount: 1899, status: "shipped", date: "2024-01-20" },
  { id: "WS456789123", customer: "Mike Johnson", amount: 15999, status: "delivered", date: "2024-01-19" },
  { id: "WS789123456", customer: "Sarah Wilson", amount: 899, status: "processing", date: "2024-01-19" },
  { id: "WS321654987", customer: "David Brown", amount: 3299, status: "shipped", date: "2024-01-18" },
]

const topProducts = [
  { name: "Quantum Chronograph Elite", sales: 45, revenue: 112455 },
  { name: "Fusion Sport Master", sales: 38, revenue: 72162 },
  { name: "Celestial Masterpiece", sales: 12, revenue: 191988 },
  { name: "Urban Explorer", sales: 67, revenue: 60233 },
  { name: "Precision Diver", sales: 23, revenue: 75877 },
]

export default function AdminDashboard() {
  const { state, logout } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/admin/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!state.admin) {
    return null
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
      {/* Admin Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="font-heading text-2xl font-black text-primary">ADMIN PANEL</h1>
              <Badge variant="secondary">{state.admin.role}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {state.admin.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="premium-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-3xl font-bold text-primary">$328,000</p>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +12.5% from last month
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-3xl font-bold text-primary">1,285</p>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +8.2% from last month
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Products</p>
                        <p className="text-3xl font-bold text-primary">156</p>
                        <div className="flex items-center text-sm text-blue-600 mt-1">
                          <Package className="h-4 w-4 mr-1" />
                          12 new this month
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="premium-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Customers</p>
                        <p className="text-3xl font-bold text-primary">2,847</p>
                        <div className="flex items-center text-sm text-green-600 mt-1">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +15.3% from last month
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#0891b2" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(order.status)}
                            <p className="font-bold text-primary mt-1">${order.amount.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.sales} sold</p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">${product.revenue.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-2xl font-bold">Product Management</h3>
                <Button className="premium-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <Card className="premium-hover">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-xl font-bold mb-2">Product Management</h3>
                    <p className="text-muted-foreground mb-4">Comprehensive product management interface coming soon</p>
                    <Button variant="outline" className="premium-hover bg-transparent">
                      View Product Catalog
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-2xl font-bold">Order Management</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <Card className="premium-hover">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer} • {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(order.status)}
                          <p className="font-bold text-primary">${order.amount.toLocaleString()}</p>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-2xl font-bold">User Management</h3>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search Users
                </Button>
              </div>

              <Card className="premium-hover">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading text-xl font-bold mb-2">User Management</h3>
                    <p className="text-muted-foreground mb-4">Advanced user management tools and analytics</p>
                    <Button variant="outline" className="premium-hover bg-transparent">
                      View All Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-heading text-2xl font-bold">Analytics & Reports</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Monthly Sales Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#0891b2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="premium-hover">
                  <CardHeader>
                    <CardTitle>Order Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
