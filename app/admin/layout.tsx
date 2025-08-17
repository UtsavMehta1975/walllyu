import type React from "react"
import { AdminProvider } from "@/lib/admin-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminProvider>{children}</AdminProvider>
}
