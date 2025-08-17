import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://walnut-store.vercel.app"

  // Static pages
  const staticPages = ["", "/products", "/auth/login", "/auth/register", "/checkout", "/profile"]

  // Generate product pages (mock data)
  const productIds = Array.from({ length: 50 }, (_, i) => i + 1)
  const productPages = productIds.map((id) => `/products/${id}`)

  const allPages = [...staticPages, ...productPages]

  return allPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "daily" : page.includes("/products/") ? "weekly" : "monthly",
    priority: page === "" ? 1 : page === "/products" ? 0.9 : page.includes("/products/") ? 0.8 : 0.7,
  })) as MetadataRoute.Sitemap
}
