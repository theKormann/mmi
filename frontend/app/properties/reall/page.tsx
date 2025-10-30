'use client';

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search, BedDouble, Building, Bath, Car, DollarSign, AlertCircle, X, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PropertyCard from "@/components/property-card";
import Footer from "@/components/footer";
import { PopularSearches } from "@/components/popular-searches";

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
  handle: string;
  mapUrl: string | null;
  description: string | null;
  type: string;
  transactionType: "VENDA" | "LOCACAO" | "VENDA_E_LOCACAO";
};

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
  );
}

function ReallContent() {
  const searchParams = useSearchParams();

  // 1. ADICIONADO NOVO ESTADO PARA A TRANSAÇÃO
  const [transaction, setTransaction] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("todos");
  const [bedrooms, setBedrooms] = useState("todos");
  const [bathrooms, setBathrooms] = useState("todos");
  const [garages, setGarages] = useState("todos");
  const [priceRange, setPriceRange] = useState("todos");
  
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllProperties() {
      try {
        const res = await fetch("https://mmi-fl6u.onrender.com/api/properties");
        if (!res.ok) throw new Error("Não foi possível carregar os imóveis.");
        const data = await res.json();
        setAllProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro inesperado.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllProperties();
  }, []);

  // 2. useEffect ATUALIZADO para ler todos os parâmetros da URL
  useEffect(() => {
    const typeFromUrl = searchParams.get("type");
    const searchFromUrl = searchParams.get("search");
    const transactionFromUrl = searchParams.get("transaction");

    if (typeFromUrl) {
      const singularType = typeFromUrl.endsWith("s") ? typeFromUrl.slice(0, -1) : typeFromUrl;
      const validTypes = ["Apartamento", "Casa", "Cobertura", "Terreno", "Comercial", "Rural"];
      if (validTypes.includes(singularType)) {
        setPropertyType(singularType);
      }
    }

    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }

    if (transactionFromUrl === 'VENDA' || transactionFromUrl === 'LOCACAO') {
      setTransaction(transactionFromUrl);
    }
  }, [searchParams]);

  // 3. useMemo ATUALIZADO com a nova lógica de filtro
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      const matchesTransaction =
        transaction === "todos" ||
        property.transactionType === transaction ||
        property.transactionType === "VENDA_E_LOCACAO";

      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = propertyType === "todos" || property.type === propertyType;
      const matchesBedrooms = bedrooms === "todos" || property.bedrooms >= parseInt(bedrooms, 10);
      const matchesBathrooms = bathrooms === "todos" || property.bathrooms >= parseInt(bathrooms, 10);
      const matchesGarages = garages === "todos" || (property.garages ?? 0) >= parseInt(garages, 10);

      const matchesPrice = () => {
        if (priceRange === 'todos') return true;
        const [min, max] = priceRange.split('-').map(Number);
        if (max) {
          return property.price >= min && property.price <= max;
        }
        return property.price >= min;
      };

      return matchesTransaction && matchesSearch && matchesType && matchesBedrooms && matchesBathrooms && matchesGarages && matchesPrice();
    });
  }, [transaction, searchTerm, propertyType, bedrooms, bathrooms, garages, priceRange, allProperties]);
  
  const handleClearFilters = () => {
    setTransaction("todos");
    setSearchTerm("");
    setPropertyType("todos");
    setBedrooms("todos");
    setBathrooms("todos");
    setGarages("todos");
    setPriceRange("todos");
  };

  const renderPropertiesGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <PropertyCardSkeleton key={idx} />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <span className="text-red-500 font-semibold">{error}</span>
        </div>
      );
    }
    if (filteredProperties.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-10 w-10 text-[#4D4D4D] mb-4" />
            <span className="text-[#4D4D4D] font-semibold">Nenhum imóvel encontrado.</span>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    );
  };

  return (
    <>
      <main className="bg-gray-50 container mx-auto px-4 py-12">
        <section>
          <div className="bg-white p-6 rounded-lg mb-8 border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold flex items-center text-[#000000]">
                  <Sparkles className="mr-3 h-6 w-6 text-[#0C2D5A]" />
                  Encontre seu Imóvel
              </h2>
              <Button variant="ghost" onClick={handleClearFilters} className="text-sm text-[#4D4D4D] hover:text-[#000000]">
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
              </Button>
            </div>

            {/* 5. JSX ATUALIZADO com o novo Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={transaction} onValueChange={setTransaction}>
                <SelectTrigger>
                  <KeyRound className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Finalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Comprar ou Alugar</SelectItem>
                  <SelectItem value="VENDA">Comprar</SelectItem>
                  <SelectItem value="LOCACAO">Alugar</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4D4D4D]/70" />
                <Input
                  type="text"
                  placeholder="Busque por título, bairro ou cidade..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <Building className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Tipo de Imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Cobertura">Cobertura</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <DollarSign className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Faixa de Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer Valor</SelectItem>
                  <SelectItem value="0-300000">Até R$ 300.000</SelectItem>
                  <SelectItem value="300000-600000">R$ 300.000 - R$ 600.000</SelectItem>
                  <SelectItem value="600000-1000000">R$ 600.000 - R$ 1.000.000</SelectItem>
                  <SelectItem value="1000000-2000000">R$ 1.000.000 - R$ 2.000.000</SelectItem>
                  <SelectItem value="2000000">Acima de R$ 2.000.000</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger>
                  <BedDouble className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Quartos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer nº de Quartos</SelectItem>
                  <SelectItem value="1">1+ Quarto</SelectItem>
                  <SelectItem value="2">2+ Quartos</SelectItem>
                  <SelectItem value="3">3+ Quartos</SelectItem>
                  <SelectItem value="4">4+ Quartos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={bathrooms} onValueChange={setBathrooms}>
                <SelectTrigger>
                  <Bath className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Banheiros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer nº de Banheiros</SelectItem>
                  <SelectItem value="1">1+ Banheiro</SelectItem>
                  <SelectItem value="2">2+ Banheiros</SelectItem>
                  <SelectItem value="3">3+ Banheiros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={garages} onValueChange={setGarages}>
                <SelectTrigger>
                  <Car className="mr-2 h-5 w-5 text-[#4D4D4D]/70" />
                  <SelectValue placeholder="Vagas de Garagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Qualquer nº de Vagas</SelectItem>
                  <SelectItem value="1">1+ Vaga</SelectItem>
                  <SelectItem value="2">2+ Vagas</SelectItem>
                  <SelectItem value="3">3+ Vagas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <PopularSearches onSearchClick={setSearchTerm} />

          {renderPropertiesGrid()}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function ReallPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Carregando...</div>}>
      <ReallContent />
    </Suspense>
  );
}