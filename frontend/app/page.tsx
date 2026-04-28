'use client';
import FeaturedProducts from "@/components/featured-products"
import { Newsletter } from "@/components/newsletter"
import Footer from "@/components/footer"
import { SetupTooltip } from "@/components/setup-tooltip"
import ArcGalleryHero from "@/components/arc-gallery-hero"
import Location from "@/components/location"
import { HeroSearchForm } from "@/components/hero-search-form";
import AboutSection from "../components/aboutSection";
import AssistantHero from "@/components/assistantInLine";


export default function Home() {
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <main className="min-h-screen">
      <ArcGalleryHero
        images={[
          "/images/gallery1.png",
          "/images/gallery2.jpg",
          "/images/gallery3.jpg",
          "/images/gallery4.jpg",
          "/images/gallery5.jpg",
          "/images/gallery6.jpg",
          "/images/gallery7.jpg",
          "/images/gallery8.jpg",
          "/images/gallery9.jpg",
          "/images/gallery10.jpg"
        ]}
        startAngle={-110}
        endAngle={110}
        radiusLg={480}
        radiusMd={360}
        radiusSm={260}
        cardSizeLg={120}
        cardSizeMd={100}
        cardSizeSm={80}
        className="pt-16 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24"
      />
      <FeaturedProducts />
      <section className="relative z-10 px-4 -mt-20 pb-20">
        
        <AssistantHero />
      </section>

      <AboutSection />
      <Location />
      <Newsletter />
      <Footer />

      {!isShopifyConfigured && <SetupTooltip />}
    </main>
  )
}