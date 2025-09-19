import { ProductsPageClient } from "@/components/products-page-client"
import { SetupTooltip } from "@/components/setup-tooltip"

export default function ProductsPage() {
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <>
      <ProductsPageClient />
      {!isShopifyConfigured && <SetupTooltip />}
    </>
  )
}
