"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"
import { getStoreName } from "@/lib/store-name"
import { useProducts } from "@/hooks/use-shopify"
import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  const storeName = getStoreName()
  const { products: properties, loading } = useProducts()

  const isConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  const featuredProperty = useMemo(() => {
    if (properties.length === 0) return null
    const randomIndex = Math.floor(Math.random() * properties.length)
    return properties[randomIndex]
  }, [properties])

  const propertyDetails = useMemo(() => {
    if (!featuredProperty) return null

    const variant = featuredProperty.variants.edges[0]?.node
    const image = featuredProperty.images.edges[0]?.node

    return {
      title: featuredProperty.title,
      location: featuredProperty.tags.find(tag => tag.startsWith('location:'))?.replace('location:', '') || 'Localização não informada',
      price: variant ? Number.parseFloat(variant.price.amount) : 0,
      image: image?.url || "/placeholder.svg",
      imageAlt: image?.altText || featuredProperty.title,
      handle: featuredProperty.handle,
    }
  }, [featuredProperty])

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col justify-center">
      <div className="container mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <Badge
              variant="outline"
              className="border-blue-600 text-blue-600 bg-blue-50 px-4 py-2 w-fit rounded-full"
            >
              <Star className="w-4 h-4 mr-2 fill-blue-600" />
              {isConfigured ? "Imóvel em Destaque" : "Propriedades de Demonstração"}
            </Badge>

            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-blue-950 mb-4 leading-tight">
                Encontre o lar ideal
                <span className="block text-blue-600">{storeName}</span>
              </h1>
              <p className="text-xl text-blue-800/80 max-w-lg leading-relaxed">
                {isConfigured
                  ? "Descubra uma seleção exclusiva de imóveis com conforto, segurança e sofisticação."
                  : "Esta é uma demonstração. Conecte seu catálogo de produtos para exibir propriedades reais."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/properties">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6 shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  Ver Imóveis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-6 bg-transparent transition-all duration-300 transform hover:-translate-y-1"
                >
                  Explorar Categorias
                </Button>
              </Link>
            </div>
          </div>

          {/* Conteúdo da direita (Card do Imóvel) */}
          <div className="relative animate-fade-in-up delay-300">
            {loading ? (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 animate-pulse h-[400px]"></div>
            ) : propertyDetails ? (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-2xl transition-all duration-500 hover:scale-105">
                <Link href={`/property/${propertyDetails.handle}`}>
                  <Image
                    src={propertyDetails.image}
                    alt={propertyDetails.imageAlt}
                    width={500}
                    height={400}
                    className="w-full h-[300px] md:h-[400px] object-cover rounded-lg mb-4 cursor-pointer"
                  />
                </Link>
                <div className="space-y-2">
                  <h3 className="font-semibold text-2xl text-blue-900">{propertyDetails.title}</h3>
                  <p className="text-blue-700 text-lg">{propertyDetails.location}</p>
                  <p className="font-bold text-2xl text-blue-800">R$ {propertyDetails.price.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 h-[400px] flex items-center justify-center">
                <p className="text-blue-500">Nenhum imóvel disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Imagem de Fundo e Estatísticas */}
      <div 
        className="absolute bottom-0 left-0 w-full h-64 bg-repeat-x opacity-70 pointer-events-none z-0"
        style={{ backgroundImage: "url('/city.png')" }} 
      />
      
      {/* Estatísticas posicionadas sobre a imagem de fundo */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-4xl z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-900">500+</p>
              <p className="text-blue-700 text-sm">Clientes Satisfeitos</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-900">{isConfigured ? `${properties.length}+` : "50+"}</p>
              <p className="text-blue-700 text-sm">Propriedades</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-900">99%</p>
              <p className="text-blue-700 text-sm">Satisfação</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-900">24/7</p>
              <p className="text-blue-700 text-sm">Atendimento</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}