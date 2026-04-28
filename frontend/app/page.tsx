'use client';
import FeaturedProducts from "@/components/featured-products"
import { Newsletter } from "@/components/newsletter"
import Footer from "@/components/footer"
import { SetupTooltip } from "@/components/setup-tooltip"
import ArcGalleryHero from "@/components/arc-gallery-hero"
import Location from "@/components/location"
import { HeroSearchForm } from "@/components/hero-search-form"
import AboutSection from "../components/aboutSection"

// 1. ADICIONE A IMPORTAÇÃO DO ASSISTENTE AQUI:
import AssistantInline from "@/components/assistantInLine"

export default function Home() {
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  return (
    <main className="min-h-screen">
    
      <FeaturedProducts />
      
      <section className="mt-16 mb-16 text-center px-4">
        <h1 className="text-4xl font-extrabold text-[#0C2D5A] mb-2 tracking-tight">
          Encontre o imóvel dos seus sonhos
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Alugar, Administrar e Vender com a gente é fácil, rápido e seguro.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-12 w-full">
          <HeroSearchForm />
          
          <div className="w-full relative z-10">
             <AssistantInline />
          </div>
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