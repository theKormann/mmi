// pages/index.tsx (ou onde seu HomePage estiver)

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Home,
  Building2,
  KeyRound,
  MapPin,
  DollarSign,
  Heart,
  Bell,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Tag,
  Percent,
  Clock,
  Video,
  MessageSquareQuote,
  Star
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AnimatedBackground from "@/components/animated-background";
import PropertyCard from "@/components/property-card"
import OpportunityCard from "@/components/opportunity-card"
import PropertyTypeCard from "@/components/property-type-card"
import Footer from "@/components/footer"
import { HeroSearchForm } from "@/components/hero-search-form"
import { HeroCarousel } from "@/components/hero-carousel"

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
  transactionType: "VENDA" | "LOCACAO" | "VENDA_E_LOCACAO";
}

function PropertyCardSkeleton() {
  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl">
      <div className="h-64 w-full animate-pulse bg-gray-200" />
      <CardContent className="flex-grow p-6">
        <div className="mb-4 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-300" />
      </CardFooter>
    </Card>
  )
}

export default function HomePage() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch("https://mmi-fl6u.onrender.com/api/properties")
        if (!res.ok) {
          throw new Error("Nenhum imóvel em destaque disponível no momento.")
        }
        const data = await res.json()
        setFeaturedProperties(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const specialOpportunities = [
    {
      title: "Feirão de Lançamentos",
      details: "Condições Especiais",
      image: "/images/oportunidade1.jpg",
      endDate: "Fim do Mês",
      gradient: "from-sky-500 to-blue-500",
    },
    {
      title: "Imóveis com Desconto",
      details: "Até 15% OFF",
      image: "/images/oportunidade2.jpg",
      endDate: "Esta Semana",
      gradient: "from-green-500 to-teal-500",
    },
    {
      title: "Condomínio Villa Real",
      details: "Últimas Unidades",
      image: "/images/oportunidade3.jpg",
      endDate: "Hoje!",
      gradient: "from-amber-500 to-orange-500",
    },
  ]
  const testimonials = [
    {
      quote: "O processo foi incrivelmente rápido e transparente. Encontramos o apartamento dos nossos sonhos em menos de um mês. Recomendo a todos!",
      author: "Juliana Costa",
      details: "Comprou um apartamento em Pinheiros",
      avatar: "/avatars/juliana.png",
      rating: 5,
    },
    {
      quote: "Profissionalismo exemplar da equipe. Eles entenderam exatamente o que nossa família precisava e nos apresentaram a casa perfeita.",
      author: "Ricardo Almeida",
      details: "Comprou uma casa em Valinhos",
      avatar: "/avatars/ricardo.png",
      rating: 5,
    },
    {
      quote: "Como investidor, preciso de agilidade e boas oportunidades. A consultoria foi essencial para eu tomar a decisão certa e rentável.",
      author: "Fernanda Lima",
      details: "Investiu em um studio",
      avatar: "/avatars/fernanda.png",
      rating: 5,
    },
  ]
  const propertyTypes = [
    { name: "Apartamentos", icon: <Building2 className="h-8 w-8" />, color: "from-blue-500 to-cyan-500" },
    { name: "Casas", icon: <Home className="h-8 w-8" />, color: "from-emerald-500 to-teal-500" },
    { name: "Coberturas", icon: <Sparkles className="h-8 w-8" />, color: "from-purple-500 to-indigo-500" },
    { name: "Terrenos", icon: <MapPin className="h-8 w-8" />, color: "from-amber-500 to-yellow-500" },
    { name: "Comercial", icon: <DollarSign className="h-8 w-8" />, color: "from-slate-500 to-slate-700" },
    { name: "Rurais", icon: <KeyRound className="h-8 w-8" />, color: "from-green-500 to-lime-500" },
  ]
  const virtualTours = [
    {
      title: "Tour Ao Vivo - Apto. Jardins",
      agent: "Ana Clara",
      viewers: "1.2k",
      image: "/images/tour1.jpg",
    },
    {
      title: "Conheça a Casa de Campo dos Sonhos",
      agent: "Marcos Andrade",
      viewers: "875",
      image: "/images/tour2.jpg",
    },
    {
      title: "Decorado - Condomínio Praça das Flores",
      agent: "Imobiliária VivaBem",
      viewers: "2.3k",
      image: "/images/tour3.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-[#000000]">
      <AnimatedBackground />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="hidden md:block w-56 shrink-0">
            <div className="space-y-6 sticky top-24">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/80">
                <h3 className="font-medium text-[#0C2D5A] mb-3 flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  TIPOS DE IMÓVEL
                </h3>
                <ul className="space-y-2">
                  {["Apartamento", "Casa", "Cobertura", "Terreno", "Comercial"].map((type, index) => (
                    <li key={index}>
                      <Link
                        href={`/properties/reall?type=${type}`}
                        className="flex items-center justify-between text-[#4D4D4D] hover:text-[#1F4F91] transition-colors duration-300 group"
                      >
                        <span>{type}</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200/80">
                <h3 className="font-medium text-[#0C2D5A] mb-3 flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  BUSCAS POPULARES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Piscina", "Churrasqueira", "Condomínio Fechado", "Perto do Metrô", "Varanda Gourmet"].map(
                    (tag, index) => (
                      <Link href={`/properties/reall?search=${encodeURIComponent(tag)}`} key={index}>
                        <Badge className="bg-gray-200 text-[#4D4D4D] hover:bg-[#0C2D5A] hover:text-white transition-colors duration-300 cursor-pointer">
                          {tag}
                        </Badge>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            
            <section className="mb-10">
              <h2 className="text-2xl font-bold flex items-center mb-6">
                <Tag className="mr-2 h-5 w-5 text-[#0C2D5A]" />
                Navegue por Tipo
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {propertyTypes.map((category, index) => (
                  <PropertyTypeCard key={index} category={category} />
                ))}
              </div>
            </section>

            <section className="mb-10">
              <HeroCarousel />
            </section>

            <section className="mb-10 text-center">
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


            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#0C2D5A]" />
                  Últimas Adições
                </h2>
                <a href="/properties/reall">
                  <Button variant="outline" className="border-[#0C2D5A] text-[#0C2D5A] hover:bg-[#0C2D5A] hover:text-white transition-all duration-300">
                    Ver Todos
                  </Button>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading && (
                  <>
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                  </>
                )}
                {error && <p className="col-span-full text-center text-red-600">{error}</p>}
                {!loading && !error && featuredProperties.length === 0 && (
                  <p className="col-span-full text-center text-[#4D4D4D]">Nenhum imóvel em destaque encontrado no momento.</p>
                )}
                {!loading && !error && featuredProperties.slice(0, 4).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold flex items-center mb-6">
                <Percent className="mr-2 h-5 w-5 text-[#0C2D5A]" />
                Oportunidades Únicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {specialOpportunities.map((deal, index) => (
                  <OpportunityCard key={index} opportunity={deal} />
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold flex items-center mb-6">
                <MessageSquareQuote className="mr-2 h-5 w-5 text-[#0C2D5A]" />
                O Que Nossos Clientes Dizem
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/80 flex flex-col">
                    <div className="flex items-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[#4D4D4D] italic mb-6 flex-grow">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        <AvatarFallback className="bg-[#0C2D5A]/10 text-[#0C2D5A] font-semibold">
                          {testimonial.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-[#000000]">{testimonial.author}</p>
                        <p className="text-sm text-[#4D4D4D]/80">{testimonial.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}