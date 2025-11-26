"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BedDouble, Bath, Ruler, Heart, MapPin, Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    price: number;
    discount?: number;
    image: string;
    location: string;
    bedrooms: number;
    bathrooms: number;
    garages: number | null; 
    area: number;
  }
}

const FeatureItem = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="flex flex-col items-center" title={label}>
    <div className="text-slate-500">{icon}</div>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const getSafeImageUrl = (imagePath: string) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  const safePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_URL}${safePath}`;
};

  
  const imageUrl = getSafeImageUrl(property.image);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className="bg-white/60 backdrop-blur-sm border-slate-200/80 overflow-hidden group relative h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-video relative overflow-hidden">
          <Link href={`/property/${property.id}`}>
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
            />
          </Link>

          {property.discount && property.discount > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-lg shadow-blue-500/20 font-bold">
                -{property.discount}% OFF
              </Badge>
            </div>
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-end p-3 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            {/* O botão "Ver Detalhes" foi REMOVIDO daqui */}
            <Button
              variant="outline"
              size="icon"
              className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-rose-500 transition-all duration-300"
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={cn("w-5 h-5 transition-colors", isFavorited && "fill-rose-500 text-rose-500")} />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 relative z-10 flex flex-col flex-grow">
          <div className="flex-grow">
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${isHovered ? "text-blue-600" : "text-slate-800"}`}>
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
              <MapPin size={14} />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-200/80">
            <div className="grid grid-cols-4 gap-2 text-center text-slate-600">
              <FeatureItem icon={<BedDouble />} value={property.bedrooms} label="Quartos" />
              <FeatureItem icon={<Bath />} value={property.bathrooms} label="Banheiros" />
              <FeatureItem icon={<Car />} value={property.garages ?? 'N/A'} label="Vagas" />
              <FeatureItem icon={<Ruler />} value={`${property.area} m²`} label="Área" />
            </div>
            
            {/* ✅ MODIFICAÇÃO: Container para o preço e o botão */}
            <div className="flex items-end justify-between pt-2">
              <div>
                {property.discount && property.discount > 0 ? (
                  <div className="flex flex-col">
                    <span className="line-through text-slate-500 text-sm">{formatPrice(property.price)}</span>
                    <span className="text-xl font-bold text-slate-900">{formatPrice(property.price * (1 - property.discount / 100))}</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-slate-900">{formatPrice(property.price)}</span>
                )}
              </div>
              <Button asChild size="sm" className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white transition-all duration-300 shadow-lg shadow-blue-500/20">
                <Link href={`/property/${property.id}`}>Detalhes</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}