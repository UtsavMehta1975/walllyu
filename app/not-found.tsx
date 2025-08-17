import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center p-8 max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-3xl font-heading font-black text-primary">404</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-4">Page Not Found</h1>
        <p className="text-slate-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="space-y-3">
          <Button asChild className="w-full bg-primary hover:bg-primary/90">
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
