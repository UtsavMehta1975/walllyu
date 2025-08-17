import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/_next/"],
    },
    sitemap: "https://walnut-store.vercel.app/sitemap.xml",
  }
}
