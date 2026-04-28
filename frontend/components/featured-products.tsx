"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import PropertyCard from "@/components/property-card"
import { Sparkles, ArrowRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Property = {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number | null;
  area: number;
}

function PropertyCardSkeleton() {
  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-2xl border-slate-200/60 shadow-sm">
      <div className="h-56 w-full animate-pulse bg-slate-200/70" />
      <CardContent className="flex-grow p-5">
        <div className="mb-3 h-6 w-3/4 animate-pulse rounded-md bg-slate-200/70" />
        <div className="h-4 w-1/2 animate-pulse rounded-md bg-slate-200/70" />
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-300/60" />
      </CardFooter>
    </Card>
  )
}

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch(`${API_URL}/api/properties`)
        if (!res.ok) {
          throw new Error("Falha ao buscar os imóveis.")
        }
        const data = await res.json()
        setProperties(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/50 p-10 text-center shadow-sm">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Tentar novamente
          </Button>
        </div>
      )
    }

    if (properties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/50 p-10 text-center shadow-sm">
          <p className="text-lg font-medium text-slate-600">Nenhum imóvel em destaque encontrado.</p>
        </div>
      )
    }

    return (
      <Carousel
        opts={{
          align: "start",
          loop: true, // Isso torna o carrossel infinito
        }}
        className="w-full pb-4"
      >
        <CarouselContent className="-ml-4 md:-ml-6">
          {properties.map((property) => (
            <CarouselItem key={property.id} className="pl-4 md:pl-6 sm:basis-1/2 lg:basis-1/3">
              <div className="h-full pb-6 pt-2">
                {/* O container interno garante que a sombra/hover não seja cortada pelo overflow do carrossel */}
                <PropertyCard property={property} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Setas de navegação (Ocultas no mobile porque o usuário pode fazer o gesto de arrastar) */}
        <CarouselPrevious className="hidden xl:flex -left-12 bg-white text-[#0C2D5A] border-slate-200 hover:bg-[#0C2D5A] hover:text-white shadow-md scale-125" />
        <CarouselNext className="hidden xl:flex -right-12 bg-white text-[#0C2D5A] border-slate-200 hover:bg-[#0C2D5A] hover:text-white shadow-md scale-125" />
      </Carousel>
    )
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf4fc] to-[#f8fafc] py-24">
      {/* Elementos decorativos de fundo */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute top-1/2 -left-24 h-72 w-72 -translate-y-1/2 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:px-8 xl:max-w-7xl">
        <div className="mb-14 flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl text-center sm:text-left">
            <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Catálogo Exclusivo</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#0C2D5A] sm:text-5xl">
              Imóveis em Destaque
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Explore nossa seleção exclusiva de imóveis e encontre a oportunidade perfeita para o seu estilo de vida.
            </p>
          </div>

          <div className="hidden sm:block">
            <Button asChild variant="ghost" className="group text-[#0C2D5A] hover:bg-blue-50 hover:text-blue-700">
              <Link href="/properties/reall" className="flex items-center gap-2 font-semibold">
                Ver todos
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative">
          {renderContent()}
        </div>

        {/* Botão extra para mobile */}
        <div className="mt-10 flex justify-center sm:hidden">
          <Button asChild size="lg" className="w-full bg-[#0C2D5A] text-white hover:bg-blue-800 shadow-lg">
            <Link href="/properties/reall" className="flex items-center justify-center gap-2">
              Ver Todos os Imóveis <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}