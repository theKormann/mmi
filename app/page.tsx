import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"
import { SetupTooltip } from "@/components/setup-tooltip"

export default function Home() {
  // Server-side check for Shopify configuration
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <main className="min-h-screen">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
      <Footer />

      {/* Show setup tooltip only when Shopify is not configured */}
      {!isShopifyConfigured && <SetupTooltip />}
    </main>
  )
}
