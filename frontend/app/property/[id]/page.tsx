"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BedDouble, Bath, Ruler, Car, MapPin, Wallet, Phone, ChevronLeft, ChevronRight, ChevronsUpDown, Expand, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Property = {
  id: number;
  title: string;
  price: number;
  image: string; 
  images: { id: number; url: string }[]; 
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number | null;
  area: number;
  handle: string;
  mapUrl: string | null;
  description: string | null;
  type: string;
  transactionType: "VENDA" | "LOCACAO" | "VENDA_E_LOCACAO";
};

const Lightbox = ({ images, selectedIndex, onClose, onNavigate }: {
  images: string[];
  selectedIndex: number;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}) => {
  const goToPrevious = () => {
    onNavigate(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const goToNext = () => {
    onNavigate(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  // Permite navegação com as setas do teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // Fecha ao clicar no fundo
    >
      {/* Botão de Fechar */}
      <Button onClick={onClose} size="icon" variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/10 hover:text-white z-50">
        <X size={32} />
      </Button>

      {/* Botão de Navegação: Anterior */}
      <Button onClick={(e) => { e.stopPropagation(); goToPrevious(); }} size="icon" variant="ghost" className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white h-14 w-14 z-50">
        <ChevronLeft size={48} />
      </Button>

      {/* Botão de Navegação: Próximo */}
      <Button onClick={(e) => { e.stopPropagation(); goToNext(); }} size="icon" variant="ghost" className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white h-14 w-14 z-50">
        <ChevronRight size={48} />
      </Button>

      {/* Conteúdo da Imagem */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence initial={false}>
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Image
              src={images[selectedIndex]}
              alt={`Imagem em tela cheia ${selectedIndex + 1}`}
              fill
              className="object-contain"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


const ImageCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  }

  const safeImages = images && images.length > 0 ? images : ["/placeholder.svg"];
  
  if (safeImages.length <= 1) {
    return (
      <div className="relative aspect-video lg:h-[500px] w-full">
        <button onClick={() => openLightbox(0)} className="w-full h-full contents">
          <Image src={safeImages[0]} alt={title} fill className="object-cover" priority />
        </button>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
        <Button onClick={() => openLightbox(0)} size="icon" variant="outline" className="absolute top-4 right-4 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
          <Expand />
        </Button>
      </div>
    )
  }

  return (
    <>
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
            <button onClick={() => openLightbox(currentIndex)} className="w-full h-full contents">
              <Image
                src={safeImages[currentIndex]}
                alt={`${title} - Imagem ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority
              />
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Botões de Navegação */}
        <Button onClick={goToPrevious} size="icon" variant="outline" className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
          <ChevronLeft />
        </Button>
        <Button onClick={goToNext} size="icon" variant="outline" className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
          <ChevronRight />
        </Button>
        
        {/* Botão de Expandir (Tela Cheia) */}
        <Button onClick={() => openLightbox(currentIndex)} size="icon" variant="outline" className="absolute top-4 right-4 bg-white/20 border-white/30 text-white hover:bg-white hover:text-slate-800 z-10">
          <Expand />
        </Button>

        {/* Indicadores de Paginação */}
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
      
      {/* Renderização condicional do Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <Lightbox
            images={safeImages}
            selectedIndex={currentIndex}
            onClose={() => setIsLightboxOpen(false)}
            onNavigate={(newIndex) => setCurrentIndex(newIndex)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

const ExpandableDescription = ({ text, maxLength = 200 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!text) return null
  if (text.length <= maxLength) {
    return <p className="text-[#4D4D4D] leading-relaxed break-words">{text}</p>
  }

  return (
    <div className="relative">
      <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-none" : "max-h-28")}>
        <p className="text-[#4D4D4D] leading-relaxed pb-4 break-words">{text}</p>
      </div>
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}
      <Button variant="link" onClick={() => setIsExpanded(!isExpanded)} className="text-[#0C2D5A] hover:text-[#1F4F91] p-0 mt-2 font-semibold">
        {isExpanded ? "Ler menos" : "Ler mais"}
        <ChevronsUpDown className="w-4 h-4 ml-1" />
      </Button>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [carouselImages, setCarouselImages] = useState<string[]>([])

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/properties/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Falha na resposta da rede');
          return res.json();
        })
        .then((data: Property) => {
          setProperty(data)
          
          const allImages = [];
          
          // 1. Adiciona a imagem principal primeiro, se existir
          if (data.image) {
            allImages.push(data.image);
          }
          
          // 2. Adiciona as imagens da galeria, se existirem
          if (data.images && data.images.length > 0) {
            data.images.forEach(img => allImages.push(img.url));
          }
          
          setCarouselImages(allImages);
        })
        .catch(err => console.error("Falha ao buscar dados do imóvel:", err))
    }
  }, [id])

  if (!property) return <PropertyDetailSkeleton />

  const phoneNumber = "5511982724430";
  const message = `Olá! Tenho interesse no imóvel ID: ${property.id} - "${property.title}". Gostaria de mais informações.`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden">
          <ImageCarousel images={carouselImages} title={property.title} />

          <div className="p-6 md:p-10">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
                {property.title}
              </h1>
              <div className="flex items-center text-[#4D4D4D] gap-2">
                <MapPin className="w-5 h-5 text-[#0C2D5A]" />
                <p>{property.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center my-8 p-4 bg-[#0C2D5A]/5 border border-[#0C2D5A]/10 rounded-xl">
              <FeatureItem icon={<BedDouble />} value={property.bedrooms} label="Quartos" />
              <FeatureItem icon={<Bath />} value={property.bathrooms} label="Banheiros" />
              <FeatureItem icon={<Car />} value={property.garages || 0} label="Vagas" />
              <FeatureItem icon={<Ruler />} value={property.area} label="m²" isArea />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-semibold text-[#000000] border-b pb-3 mb-4">Sobre o Imóvel</h2>
                <ExpandableDescription text={property.description || ""} />
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white p-6 border rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Wallet className="w-8 h-8 text-[#0C2D5A]" />
                    <div>
                      <p className="text-sm text-[#4D4D4D]">Valor do imóvel</p>
                      <p className="text-3xl font-bold text-[#000000]">
                        {typeof property.price === "number"
                          ? property.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "Preço não disponível"}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="lg" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-300 shadow-lg shadow-green-500/20">
                    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <Phone className="w-5 h-5 mr-2" />
                      Entrar em Contato
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {property.mapUrl && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-[#000000] border-b pb-3 mb-4">Localização</h2>
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
      <div className="flex justify-center items-center text-[#0C2D5A] mb-2">{icon}</div>
      <p className="text-xl font-bold text-[#000000]">{value}{isArea && ' m²'}</p>
      <p className="text-sm text-[#4D4D4D]">{!isArea && label}</p>
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