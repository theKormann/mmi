"use client"

import { useEffect, useState } from "react"
import { Bed, Bath, Car, Ruler, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

type Property = {
  id: number;
  title: string;
  price: number;
  image: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  handle: string;
}

// NOVO: Componente Skeleton para o estado de carregamento
function PropertyCardSkeleton() {
  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl">
      <div className="h-64 w-full animate-pulse bg-slate-200" />
      <CardContent className="flex-grow p-6">
        <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="h-10 w-full animate-pulse rounded-lg bg-slate-300" />
      </CardFooter>
    </Card>
  )
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="group flex h-full w-full flex-col overflow-hidden rounded-xl border-slate-200 transition-all duration-300 hover:border-blue-300 hover:shadow-xl">
        <div className="relative overflow-hidden">
          <Link href={`/property/${property.id}`}>
            <Image
              src={property.image || "/placeholder.svg"}
              alt={property.title || "Imagem do imóvel"}
              width={400}
              height={300}
              className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

          </Link>
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
            <p className="font-bold text-white text-2xl">
              {property.price.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' })}
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-200">
              <MapPin size={14} />
              <span>{property.location}</span>
            </div>
          </div>
        </div>
        <CardContent className="flex-grow p-6">
          <h3 className="mb-4 font-semibold text-xl text-slate-800 transition-colors group-hover:text-blue-600">{property.title}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-slate-600">
            <div className="flex items-center gap-2"><Bed className="h-5 w-5 text-slate-400" /><span>{property.bedrooms} quartos</span></div>
            <div className="flex items-center gap-2"><Bath className="h-5 w-5 text-slate-400" /><span>{property.bathrooms} banheiros</span></div>
            <div className="flex items-center gap-2"><Car className="h-5 w-5 text-slate-400" /><span>{property.garages} vagas</span></div>
            <div className="flex items-center gap-2"><Ruler className="h-5 w-5 text-slate-400" /><span>{property.area} m²</span></div>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            {/* CORRIGIDO: Link padronizado para usar o ID */}
            <Link href={`/property/${property.id}`}>
              Ver Detalhes
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default function FeaturedProperties() {
  // NOVO: Estados de carregamento e erro
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("http://localhost:8080/api/properties")
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
    // Estado de carregamento
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      )
    }

    // Estado de erro
    if (error) {
      return <p className="text-center text-red-600">{error}</p>
    }

    // Estado vazio
    if (properties.length === 0) {
      return <p className="text-center text-slate-600">Nenhum imóvel em destaque encontrado no momento.</p>
    }

    // Conteúdo renderizado com sucesso
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Mostra apenas os 3 primeiros imóveis como destaque */}
        {properties.slice(0, 3).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    )
  }

  return (
    <section className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Imóveis em Destaque
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Confira algumas das melhores opções selecionadas para você morar ou investir.
          </p>
        </div>

        {renderContent()}

        <div className="mt-16 text-center">
          <Button
            asChild
            size="lg"
            className="border-2 border-blue-600 bg-transparent px-8 py-3 font-semibold text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
          >
            <Link href="/properties">Ver Todos os Imóveis</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}