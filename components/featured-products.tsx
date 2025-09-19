"use client"

import { Bed, Bath, Car, Ruler, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card" 
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

// --- TIPAGEM DOS DADOS (BOA PRÁTICA COM TYPESCRIPT) ---
type Property = {
  id: string;
  title: string;
  price: number;
  image: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  handle: string;
};

// --- DADOS MOCKADOS ---
const featuredProperties: Property[] = [
  {
    id: "1",
    title: "Apartamento Moderno no Centro",
    price: 750000,
    image: "images/gallery3.jpg",
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
];

// --- COMPONENTE DO CARD (REUTILIZÁVEL) ---
function PropertyCard({ property }: { property: Property }) {
  return (
    <Card className="group flex h-full w-full flex-col overflow-hidden rounded-xl border-slate-200 transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
      <div className="relative overflow-hidden">
        <Link href={`/property/${property.handle}`}>
          <Image
            src={property.image}
            alt={property.title}
            width={400}
            height={300}
            className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
          <p className="font-bold text-white text-2xl">
            R$ {property.price.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-200">
            <MapPin size={14} />
            <span>{property.location}</span>
          </div>
        </div>
      </div>
      <CardContent className="flex-grow p-6">
        <h3 className="mb-4 font-semibold text-xl text-slate-800">{property.title}</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-slate-600">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-slate-500" />
            <span>{property.bedrooms} quartos</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="h-5 w-5 text-slate-500" />
            <span>{property.bathrooms} banheiros</span>
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-slate-500" />
            <span>{property.garages} vagas</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-slate-500" />
            <span>{property.area} m²</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full bg-slate-900 text-white hover:bg-slate-800">
          <Link href={`/property/${property.handle}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function FeaturedProperties() {
  return (
    <section className="bg-[#98c3ed] py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Imóveis em Destaque
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Confira algumas das melhores opções selecionadas para você morar ou investir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}