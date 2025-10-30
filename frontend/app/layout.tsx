import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { CartProvider } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/cart-drawer"
import { getStoreName } from "@/lib/store-name"
import { CookieWrapper } from '@/components/CookieWrapper' 

const inter = Inter({ subsets: ["latin"] })

const storeName = getStoreName()

export const metadata: Metadata = {
  title: `${storeName} - Outlet dos imóveis`,
  description: `Descubra o imóvel feito para você. ${storeName} sinônimo de Qualidade, estilo e inovação em cada compra.`,
  generator: 'v.app',
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Navbar />
          {children}
          <CartDrawer />
        </CartProvider>
        <CookieWrapper />
      </body>
    </html>
  )
}