'use client';
import FeaturedProducts from "@/components/featured-products"
import Footer from "@/components/footer"
import ArcGalleryHero from "@/components/arc-gallery-hero"
import Location from "@/components/location"
import AssistantHero from "@/components/assistantInLine"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Galeria Visual de Fundo */}
      <ArcGalleryHero
        images={["/images/gallery1.png", "/images/gallery2.jpg", "/images/gallery3.jpg"]}
        className="pt-20 pb-10"
      />

      {/* Seção Hero de Conteúdo */}
      <section className="relative z-10 px-4 -mt-20 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[#0C2D5A] mb-6 tracking-tighter leading-[1.1]">
            Seu próximo imóvel está a <br/>
            <span className="text-blue-600">uma conversa de distância.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Diga à nossa inteligência artificial exatamente o que você precisa e 
            nós vasculhamos nosso catálogo para encontrar a melhor oportunidade.
          </p>
        </div>

        {/* O ASSISTENTE AGORA É O CENTRO DAS ATENÇÕES */}
        <AssistantHero />
      </section>

      <FeaturedProducts />
      <Location />
      <Footer />
    </main>
  )
}