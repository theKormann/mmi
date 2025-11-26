"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";

interface Property {
  id: number;
  title: string;
  price: number;
  image: string; 
  location: string;
  type: string;
  transactionType: "VENDA" | "LOCACAO";
}

const CarouselSkeleton = () => (
  <div className="bg-gray-200 aspect-video md:aspect-[2.4/1] rounded-xl flex items-center justify-center animate-pulse">
    <div className="w-full h-full bg-gray-300 rounded-xl"></div>
  </div>
);

export const HeroCarousel = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get<Property[]>("https://mmi-fl6u.onrender.com/api/properties");
        setProperties(response.data.slice(0, 5));
      } catch (err) {
        console.error("Erro ao buscar imóveis:", err);
        setError("Não foi possível carregar os imóveis em destaque.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <CarouselSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 aspect-video md:aspect-[2.4/1] rounded-xl flex flex-col items-center justify-center p-4">
        <h3 className="font-bold text-xl mb-2">Ocorreu um Erro</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {properties.map((property) => (
          <CarouselItem key={property.id}>
            <Card className="overflow-hidden border-none aspect-video md:aspect-[2.4/1] relative flex items-center justify-center text-white">
              <img
                src={property.image}
                alt={property.title}
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>

              <div className="z-20 relative text-center p-8 flex flex-col items-center max-w-3xl">
                <span className="bg-[#1F4F91] text-white px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {property.transactionType === "VENDA" ? "À Venda" : "Para Alugar"}
                </span>
                <h2 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                  {property.title}
                </h2>
                <div className="flex items-center gap-2 mb-4 text-gray-200 drop-shadow-md">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                <p className="text-2xl font-semibold mb-6 drop-shadow-md">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(property.price)}
                </p>
                <Button asChild size="lg" className="bg-white text-[#1F4F91] hover:bg-gray-200 font-bold">
                  <Link href={`/property/${property.id}`}>
                    Ver Detalhes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:inline-flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:inline-flex" />
    </Carousel>
  );
};