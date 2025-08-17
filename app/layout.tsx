import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { CartDrawer } from "@/components/cart-drawer"

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: ["400", "600", "700", "900"],
  preload: true,
  fallback: ["system-ui", "arial"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600"],
  preload: true,
  fallback: ["system-ui", "arial"],
})

export const metadata: Metadata = {
  title: "The Walnut Store - Premium Futuristic Analog Watches",
  description:
    "Discover premium futuristic analog watches from top brands like Tommy Hilfiger, Nike, Jacob & Co. Experience luxury timepieces with AR try-on and immersive shopping.",
  generator: "v0.app",
  keywords: [
    "luxury watches",
    "analog watches",
    "Tommy Hilfiger",
    "Nike",
    "Jacob & Co",
    "premium timepieces",
    "AR try-on",
  ],
  authors: [{ name: "The Walnut Store" }],
  creator: "The Walnut Store",
  publisher: "The Walnut Store",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://walnut-store.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Walnut Store - Premium Futuristic Analog Watches",
    description:
      "Discover premium futuristic analog watches from top brands. Experience luxury timepieces with AR try-on.",
    url: "https://walnut-store.vercel.app",
    siteName: "The Walnut Store",
    images: [
      {
        url: "/elegant-gold-wristwatch.png",
        width: 1200,
        height: 630,
        alt: "Premium analog watches at The Walnut Store",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Walnut Store - Premium Futuristic Analog Watches",
    description:
      "Discover premium futuristic analog watches from top brands. Experience luxury timepieces with AR try-on.",
    images: ["/elegant-gold-wristwatch.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0891b2" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
