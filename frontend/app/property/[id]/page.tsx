"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { BedDouble, Bath, Ruler, Car, MapPin, Wallet, Phone, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"

type Property = {
  id: number;
  title: string;
  price: number | null;
  image?: string; // backend manda um único campo
  images?: string[]; // se no futuro você mudar pra array
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  description: string;
  mapUrl: string;
}

const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const safeImages = images && images.length > 0 ? images : ["/placeholder.svg"]

  if (safeImages.length <= 1) {
    return (
      <div className="relative aspect-video lg:h-[500px] w-full">
        <Image
          src={safeImages[0]}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video lg:h-[500px] w-full overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <Image
            src={safeImages[currentIndex] || "/placeholder.svg"}
            alt={`${title} - Imagem ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <Button onClick={goToPrevious} size="icon" variant="outline" className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
        <ChevronLeft />
      </Button>
      <Button onClick={goToNext} size="icon" variant="outline" className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
        <ChevronRight />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {safeImages.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full cursor-pointer transition-all",
              currentIndex === index ? "w-4 bg-white" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  )
}

const ExpandableDescription = ({ text, maxLength = 200 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!text) return null
  if (text.length <= maxLength) {
    return <p className="text-slate-600 leading-relaxed break-words">{text}</p>
  }

  return (
    <div className="relative">
      <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-none" : "max-h-28")}>
        <p className="text-slate-600 leading-relaxed pb-4 break-words">{text}</p>
      </div>
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}
      <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 hover:text-blue-800 p-0 mt-2 font-semibold">
        {isExpanded ? "Ler menos" : "Ler mais"}
        <ChevronsUpDown className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8080/api/properties/${id}`)
        .then(res => res.json())
        .then((data) => {
          // se o backend só mandar "image" convertemos para "images"
          if (data.image && !data.images) {
            data.images = [data.image]
          }
          setProperty(data)
        })
        .catch(err => console.error("Falha ao buscar dados do imóvel:", err))
    }
  }, [id])

  if (!property) return <PropertyDetailSkeleton />

  return (
    <div className="bg-slate-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
          <ImageCarousel images={property.images || []} title={property.title} />

          <div className="p-6 md:p-10">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-slate-500 gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <p>{property.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center my-8 p-4 bg-blue-50/50 border border-blue-200/60 rounded-xl">
              <FeatureItem icon={<BedDouble />} value={property.bedrooms} label="Quartos" />
              <FeatureItem icon={<Bath />} value={property.bathrooms} label="Banheiros" />
              <FeatureItem icon={<Car />} value={property.garages} label="Vagas" />
              <FeatureItem icon={<Ruler />} value={property.area} label="m²" isArea />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold text-slate-700 border-b pb-3 mb-4">Sobre o Imóvel</h2>
                <ExpandableDescription text={property.description} />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white p-6 border rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-500">Valor do imóvel</p>
                      <p className="text-3xl font-bold text-slate-800">
                        {typeof property.price === "number"
                          ? property.price.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "Preço não disponível"}
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white transition-all duration-300 shadow-lg shadow-blue-500/20">
                    <Phone className="w-5 h-5 mr-2" />
                    Entrar em Contato
                  </Button>
                </div>
              </div>
            </div>

            {property.mapUrl && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-slate-700 border-b pb-3 mb-4">Localização</h2>
                <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border">
                  <iframe
                    src={property.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  )
}

const FeatureItem = ({ icon, value, label, isArea = false }: { icon: React.ReactNode; value: number; label: string; isArea?: boolean }) => (
  <div>
    <div className="flex justify-center items-center text-blue-600 mb-2">{icon}</div>
    <p className="text-xl font-bold text-slate-700">{value}{isArea && ' m²'}</p>
    <p className="text-sm text-slate-500">{!isArea && label}</p>
  </div>
)

function PropertyDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="w-full max-w-6xl mx-auto animate-pulse">
        <div className="bg-slate-200 rounded-2xl h-[500px] w-full mb-8"></div>
        <div className="p-6 md:p-10">
          <div className="h-8 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
          <div className="h-6 bg-slate-200 rounded-lg w-1/2 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-200 rounded-lg h-20"></div>
            <div className="bg-slate-200 rounded-lg h-20"></div>
            <div className="bg-slate-200 rounded-lg h-20"></div>
            <div className="bg-slate-200 rounded-lg h-20"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
