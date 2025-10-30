// components/hero-search-form.tsx

"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearchForm() {
  const [activeTab, setActiveTab] = useState("VENDA");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();

    params.append('transaction', activeTab);

    if (searchTerm) {
      params.append('search', searchTerm);
    }
    router.push(`/properties/reall?${params.toString()}`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80 w-full max-w-2xl">
      <div className="flex mb-4 rounded-lg bg-gray-200/60 p-1">
        <button
          onClick={() => setActiveTab("VENDA")}
          className={`w-1/2 p-3 rounded-md font-semibold transition-all duration-300 ${
            activeTab === "VENDA" ? 'bg-[#0C2D5A] text-white shadow' : 'text-gray-600 hover:bg-gray-300/50'
          }`}
        >
          Comprar
        </button>
        <button
          onClick={() => setActiveTab("LOCACAO")}
          className={`w-1/2 p-3 rounded-md font-semibold transition-all duration-300 ${
            activeTab === "LOCACAO" ? 'bg-[#0C2D5A] text-white shadow' : 'text-gray-600 hover:bg-gray-300/50'
          }`}
        >
          Alugar
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Busque por cidade, bairro ou código..."
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="h-12 px-8 bg-[#0C2D5A] hover:bg-[#1F4F91] transition-colors duration-300">
          Buscar
        </Button>
      </div>
    </div>
  );
}