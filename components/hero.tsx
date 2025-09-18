"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"
import { getStoreName } from "@/lib/store-name"
import { useProducts } from "@/hooks/use-shopify"
import { useMemo } from "react"
import Link from "next/link"

export function Hero() {
  const storeName = getStoreName();
  const { products: properties, loading } = useProducts()

  const isConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  const featuredProperty = useMemo(() => {
    if (properties.length === 0) return null
    const index = Math.floor(Math.random() * properties.length)
    return properties[index]
  }, [properties])

  const propertyDetails = useMemo(() => {
    if (!featuredProperty) return null

    const variant = featuredProperty.variants.edges[0]?.node
    const image = featuredProperty.images.edges[0]?.node

    return {
      title: featuredProperty.title,
      location: featuredProperty.title,
      price: variant ? Number.parseFloat(variant.price.amount) : 0,
      image: image?.url || "/placeholder.svg?height=400&width=400",
      imageAlt: image?.altText || featuredProperty.title,
      handle: featuredProperty.handle,
      available: variant?.availableForSale || false,
    }
  }, [featuredProperty])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      <div
        className="absolute bottom-0 left-0 w-full h-64 bg-no-repeat bg-bottom bg-cover opacity-70 pointer-events-none"
        style={{ backgroundImage: "url('/city.png')" }}
      />


      <div className="container mx-auto px-4 h-screen flex items-center relative z-10">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Texto */}
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="border-blue-600 text-blue-600 bg-blue-50 px-4 py-2 w-fit"
              >
                <Star className="w-4 h-4 mr-2 fill-blue-600" />
                {isConfigured ? "Imóvel em Destaque" : "Propriedades Demo"}
              </Badge>

              <div>
                <h1 className="text-5xl md:text-7xl font-bold text-blue-900 mb-6 leading-tight">
                  Encontre o lar ideal na
                  <span className="block text-blue-600">{storeName}</span>
                </h1>

                <p className="text-xl text-blue-800/70 mb-8 max-w-lg leading-relaxed">
                  {isConfigured
                    ? "Descubra imóveis selecionados com conforto, segurança e sofisticação."
                    : "Esta é uma demonstração. Conecte seu catálogo para mostrar propriedades reais."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/properties">
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 text-lg px-8 py-6 border-0 shadow-lg">
                    Ver Imóveis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg px-8 py-6 bg-transparent"
                  >
                    Explorar Categorias
                  </Button>
                </Link>
              </div>
              
            </div>

            {/* Card de imóvel */}
            <div className="relative">
              {loading ? (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 animate-pulse h-80"></div>
              ) : propertyDetails ? (
                <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-lg">
                  <Link href={`/property/${propertyDetails.handle}`}>
                    <img
                      src={propertyDetails.image}
                      alt={propertyDetails.imageAlt}
                      className="w-full h-80 object-cover rounded-lg mb-4 cursor-pointer hover:opacity-90 transition-opacity duration-300"
                    />
                  </Link>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-blue-900">{propertyDetails.title}</h3>
                    <p className="text-blue-700">{propertyDetails.location}</p>
                    <p className="font-bold text-xl text-blue-800">R$ {propertyDetails.price.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 h-80 flex items-center justify-center">
                  <p className="text-blue-500">Nenhum imóvel disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          <div className="mt-20 pt-8 border-t border-blue-200 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-900">500+</p>
                <p className="text-blue-700 text-sm">Clientes Satisfeitos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{isConfigured ? `${properties.length}+` : "50+"}</p>
                <p className="text-blue-700 text-sm">Propriedades</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">99%</p>
                <p className="text-blue-700 text-sm">Satisfação</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">24/7</p>
                <p className="text-blue-700 text-sm">Atendimento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
