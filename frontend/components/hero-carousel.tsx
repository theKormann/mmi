"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

// Dados adaptados para imóveis em destaque
const heroProperties = [
  {
    id: 1,
    title: "Cobertura Duplex com Vista para o Mar",
    location: "Ipanema, Rio de Janeiro",
    image: "/images/hero-cobertura.jpg",
    tags: ["4 Suítes", "Piscina Privativa", "Vista Panorâmica", "Mobiliado"],
    price: 12500000,
    status: "Oportunidade",
  },
  {
    id: 2,
    title: "Residência de Luxo em Condomínio Fechado",
    location: "Alphaville, São Paulo",
    image: "/images/hero-casa.jpg",
    tags: ["5 Quartos", "Área Gourmet", "Cinema", "Segurança 24h"],
    price: 8750000,
    status: "Novo no Mercado",
  },
  {
    id: 3,
    title: "Apartamento de Alto Padrão no Itaim Bibi",
    location: "Itaim Bibi, São Paulo",
    image: "/images/hero-apartamento.jpg",
    tags: ["3 Suítes", "Andar Alto", "Design Moderno", "Lazer Completo"],
    price: 6200000,
    status: "Lançamento",
  },
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [direction, setDirection] = useState(0)

  const nextSlide = () => {
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % heroProperties.length)
  }

  const prevSlide = () => {
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + heroProperties.length) % heroProperties.length)
  }
  
  // Formata o preço para o padrão brasileiro (R$)
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(nextSlide, 6000)
      return () => clearInterval(interval)
    }
  }, [isHovered, currentIndex]) // Adicionado currentIndex para reiniciar o timer a cada slide

  const currentProperty = heroProperties[currentIndex]

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div
      className="relative rounded-xl overflow-hidden shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[21/9] relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            <Image
              src={currentProperty.image}
              alt={currentProperty.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
              <div className="max-w-3xl text-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                  <Badge className="bg-gradient-to-r from-blue-500 to-sky-500 mb-3 uppercase tracking-wider border-none">
                    {currentProperty.status}
                  </Badge>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg"
                >
                  {currentProperty.title}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-slate-200 mb-4 text-base md:text-lg flex items-center gap-2 drop-shadow-md"
                >
                  <MapPin size={18} /> {currentProperty.location}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="flex items-center gap-4 flex-wrap"
                >
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 transition-all duration-300 shadow-lg shadow-blue-500/30 text-base md:text-lg py-6 px-8">
                    <Link href="#">Ver Detalhes</Link>
                  </Button>

                  <div className="font-bold text-xl md:text-2xl drop-shadow-md">
                    {formatPrice(currentProperty.price)}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroProperties.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1)
              setCurrentIndex(index)
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-blue-500 w-6" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>

      <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-10" aria-label="Slide anterior">
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm z-10" aria-label="Próximo slide">
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  )
}