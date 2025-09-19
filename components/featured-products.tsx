"use client"

import { Bed, Bath, Car, Ruler } from "lucide-react"
import { Card, CardContent } from "@/hero mmi/components/ui/card"
import { Button } from "@/hero mmi/components/ui/button"
import Link from "next/link"

const featuredProperties = [
  {
    id: "1",
    title: "Apartamento Moderno no Centro",
    price: 750000,
    image: "/property-1.jpg",
    location: "São Paulo - SP",
    bedrooms: 3,
    bathrooms: 2,
    garages: 2,
    area: 120,
    handle: "apartamento-moderno-centro",
  },
  {
    id: "2",
    title: "Casa com Piscina e Jardim",
    price: 1250000,
    image: "/property-2.jpg",
    location: "Campinas - SP",
    bedrooms: 4,
    bathrooms: 3,
    garages: 3,
    area: 250,
    handle: "casa-com-piscina",
  },
  {
    id: "3",
    title: "Cobertura de Luxo Vista Mar",
    price: 3200000,
    image: "/property-3.jpg",
    location: "Rio de Janeiro - RJ",
    bedrooms: 5,
    bathrooms: 4,
    garages: 4,
    area: 400,
    handle: "cobertura-vista-mar",
  },
]

export default function FeaturedProperties() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Imóveis em Destaque</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Confira algumas das melhores opções selecionadas para você
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded shadow text-sm font-semibold">
                  {property.location}
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-semibold text-xl text-black mb-2">{property.title}</h3>
                <p className="text-lg font-bold text-green-700 mb-4">
                  R$ {property.price.toLocaleString("pt-BR")}
                </p>

                <div className="grid grid-cols-2 gap-4 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>{property.bedrooms} quartos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>{property.bathrooms} banheiros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    <span>{property.garages} vagas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    <span>{property.area} m²</span>
                  </div>
                </div>

                <Link href={`/property/${property.handle}`}>
                  <Button className="w-full bg-black text-white hover:bg-black/90">
                    Ver Detalhes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
