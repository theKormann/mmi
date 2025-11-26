"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import PropertyCard from "@/components/property-card" 

// A URL base do seu backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Tipagem do objeto que vem da API
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
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl">
      <div className="h-52 w-full animate-pulse bg-slate-200" />
      <CardContent className="flex-grow p-4">
        <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-300" />
      </CardFooter>
    </Card>
  )
}

// ✅ CORREÇÃO: A definição duplicada e mais simples de PropertyCard foi REMOVIDA daqui.

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      )
    }

    if (error) {
      return <p className="text-center text-red-600">{error}</p>
    }

    if (properties.length === 0) {
      return <p className="text-center text-slate-600">Nenhum imóvel em destaque encontrado.</p>
    }

    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {properties.slice(0, 3).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    )
  }

  return (
    <section className="bg-[#c7e1f8] py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Imóveis em Destaque
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Confira algumas das melhores opções selecionadas para você.
          </p>
        </div>

        {renderContent()}

        <div className="mt-16 text-center">
          <Button asChild size="lg" className="border-2 border-blue-600 bg-transparent px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
            <Link href="/properties">Ver Todos os Imóveis</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}