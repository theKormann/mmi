"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Bed, Bath, Car, ArrowRight, MapPin } from "lucide-react"
import { useProducts } from "@/hooks/use-shopify"

// Placeholder products were renamed to properties
const placeholderProperties = [
  {
    id: "placeholder-1",
    title: "Casa de Campo Moderna com Vista Panorâmica",
    location: "São Paulo, SP",
    price: 1500000,
    images: ["/placeholder-property-1.jpg"],
    handle: "modern-country-house",
    details: {
      bedrooms: 4,
      bathrooms: 3,
      garages: 2,
    },
  },
  {
    id: "placeholder-2",
    title: "Apartamento de Luxo no Centro da Cidade",
    location: "Rio de Janeiro, RJ",
    price: 2500000,
    images: ["/placeholder-property-2.jpg"],
    handle: "luxury-city-apartment",
    details: {
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
    },
  },
  {
    id: "placeholder-3",
    title: "Cobertura Duplex com Piscina Privativa",
    location: "Belo Horizonte, MG",
    price: 4500000,
    images: ["/placeholder-property-3.jpg"],
    handle: "duplex-penthouse",
    details: {
      bedrooms: 5,
      bathrooms: 4,
      garages: 3,
    },
  },
  {
    id: "placeholder-4",
    title: "Loft Compacto e Inteligente em Áreas Urbanas",
    location: "Curitiba, PR",
    price: 550000,
    images: ["/placeholder-property-4.jpg"],
    handle: "compact-urban-loft",
    details: {
      bedrooms: 1,
      bathrooms: 1,
      garages: 0,
    },
  },
  {
    id: "placeholder-5",
    title: "Casa Sustentável com Jardim Amplo",
    location: "Porto Alegre, RS",
    price: 850000,
    images: ["/placeholder-property-5.jpg"],
    handle: "sustainable-house",
    details: {
      bedrooms: 3,
      bathrooms: 2,
      garages: 1,
    },
  },
  {
    id: "placeholder-6",
    title: "Mansão Histórica com Arquitetura Clássica",
    location: "Salvador, BA",
    price: 7800000,
    images: ["/placeholder-property-6.jpg"],
    handle: "classic-historic-mansion",
    details: {
      bedrooms: 6,
      bathrooms: 5,
      garages: 4,
    },
  },
]

export function FeaturedProperties() {
  const { products: properties, loading, error } = useProducts()

  // Check if Shopify store domain is configured
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  // Determine which properties to show
  const propertiesToShow = isShopifyConfigured && properties.length > 0 ? properties.slice(0, 6) : placeholderProperties

  // Show loading state for real products
  if (loading && isShopifyConfigured) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando imóveis em destaque...</p>
          </div>
        </div>
      </section>
    )
  }

  // Show error only for configured stores
  if (error && isShopifyConfigured) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar os imóveis:</p>
            <p className="text-red-500 text-sm mb-4 break-words max-w-lg mx-auto">{error}</p>
            <p className="text-gray-600 text-sm">
              Por favor, verifique se a variável de ambiente `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` está configurada corretamente.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Imóveis em Destaque</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isShopifyConfigured
              ? "Confira a seleção de imóveis de alto padrão para morar ou investir"
              : "Imóveis de demonstração - conecte sua loja Shopify para exibir imóveis reais"}
          </p>
          {!isShopifyConfigured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-2">
              Modo de Demonstração
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {propertiesToShow.map((property, index) => {
            const isRealProperty = isShopifyConfigured && properties.length > 0
            let propertyData
            return (
              <div key={propertyData.id} className="h-full">
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col relative">
                  {!isShopifyConfigured && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 z-10 bg-yellow-100 text-yellow-800 text-xs"
                    >
                      Demo
                    </Badge>
                  )}

                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative overflow-hidden">
                      <Link href={isRealProperty ? `/property/${propertyData.handle}` : "#"}>
                        <Image
                          src={propertyData.image || "/placeholder.svg"}
                          alt={propertyData.imageAlt}
                          width={400}
                          height={300}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </Link>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                         <MapPin className="h-4 w-4 mr-1" /> {propertyData.location}
                      </div>

                      <Link href={isRealProperty ? `/property/${propertyData.handle}` : "#"}>
                        <h3 className="font-semibold text-lg text-black mb-3 group-hover:text-gray-600 transition-colors cursor-pointer line-clamp-2 h-14 leading-7">
                          {propertyData.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-4 text-gray-600 mt-2 mb-4">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{propertyData.details?.bedrooms || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{propertyData.details?.bathrooms || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          <span>{propertyData.details?.garages || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                        <span className="text-2xl font-bold text-black">
                          R$ {propertyData.price.toLocaleString('pt-BR')}
                        </span>
                        
                        <Link href={isRealProperty ? `/property/${propertyData.handle}` : "#"}>
                          <Button 
                            variant="ghost" 
                            className="bg-black text-white hover:bg-gray-800 rounded-full"
                          >
                            Ver Detalhes
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/properties">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              Ver Todos os Imóveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}