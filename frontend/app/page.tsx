'use client';
import FeaturedProducts from "@/components/featured-products"
import { Newsletter } from "@/components/newsletter"
import Footer from "@/components/footer"
import { SetupTooltip } from "@/components/setup-tooltip"
import ArcGalleryHero from "@/components/arc-gallery-hero"
import Location from "@/components/location"
import { HeroSearchForm } from "@/components/hero-search-form";
import AboutSection from "../components/aboutSection";


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
      <section className="mt-16 mb-16 text-center">
        <h1 className="text-4xl font-extrabold text-[#0C2D5A] mb-2 tracking-tight">
          Encontre o imóvel dos seus sonhos
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Alugar, Administrar e Vender com a gente é fácil, rápido e seguro.
        </p>
        <div className="flex justify-center">
          <HeroSearchForm />
        </div>
      </section>

      <AboutSection />
      <Location />
      <Newsletter />
      <Footer />

      {!isShopifyConfigured && <SetupTooltip />}
    </main>
  )
}