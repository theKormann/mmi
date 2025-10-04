"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Property } from "../../services/api"; // Apenas para tipagem
import axios from "axios";

// --- Constantes ---
const propertyTypes: Property["type"][] = [
  "Apartamento",
  "Casa",
  "Cobertura",
  "Terreno",
  "Comercial",
  "Rural",
];

const transactionTypes: ("VENDA" | "LOCACAO")[] = ["VENDA", "LOCACAO"];

// É uma boa prática definir a URL base da API em um só lugar
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- Componente ---
export default function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();

  // --- State Hooks ---
  const [formData, setFormData] = useState<Omit<Property, "id">>(
    property || {
      title: "",
      type: "Apartamento",
      transactionType: "VENDA",
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      garages: 0,
      area: 0,
      location: "",
      image: "",
      mapUrl: "",
      handle: "",
      description: "",
    }
  );

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Handlers de Eventos ---
  const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "bedrooms", "bathrooms", "garages", "area"].includes(name)
        ? Number(value) || 0
        : value,
    }));
  };

  const handleTypeChange = (value: Property["type"]) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleTransactionChange = (value: "VENDA" | "LOCACAO") => {
    setFormData((prev) => ({ ...prev, transactionType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property?.id && !mainImage) {
      setError("A imagem principal é obrigatória para cadastrar um novo imóvel.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (property?.id) {
        // Lógica de ATUALIZAÇÃO (envia apenas JSON, como o backend espera)
        await axios.put(`${API_URL}/api/properties/${property.id}`, formData);
        alert("Imóvel atualizado com sucesso!");
      } else {
        // Lógica de CRIAÇÃO (envia multipart/form-data)
        const data = new FormData();

        // 1. Adiciona os dados do imóvel como um "Blob" JSON
        data.append(
          "property",
          new Blob([JSON.stringify(formData)], { type: "application/json" })
        );

        // 2. Adiciona a imagem principal
        if (mainImage) {
          data.append("mainImage", mainImage);
        }

        // 3. Adiciona as imagens da galeria
        if (galleryImages) {
          Array.from(galleryImages).forEach((file) => {
            data.append("gallery", file);
          });
        }

        // 4. Envia a requisição única para o backend
        await axios.post(`${API_URL}/api/properties`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Imóvel cadastrado com sucesso!");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Erro ao salvar. Verifique os campos e tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização do Componente ---
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-100 pb-4">
        {property ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
      </h2>

      {/* Linha 1: Título e Preço */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-medium">Título do Anúncio</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Apartamento com vista para o parque" required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className="font-medium">Preço (R$)</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Ex: 750000" required/>
        </div>
      </div>

      {/* Linha 2: Tipo e Transação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="type" className="font-medium">Tipo de Imóvel</Label>
          <Select value={formData.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transactionType" className="font-medium">Finalidade</Label>
          <Select value={formData.transactionType} onValueChange={handleTransactionChange}>
            <SelectTrigger id="transactionType"><SelectValue /></SelectTrigger>
            <SelectContent>
              {transactionTypes.map((tt) => (
                <SelectItem key={tt} value={tt}>{tt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linha 3: Quartos, Banheiros, Garagem, Área */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bedrooms" className="font-medium">Quartos</Label>
          <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} placeholder="Ex: 3"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms" className="font-medium">Banheiros</Label>
          <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} placeholder="Ex: 2"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="garages" className="font-medium">Vagas</Label>
          <Input id="garages" name="garages" type="number" value={formData.garages} onChange={handleChange} placeholder="Ex: 2"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="area" className="font-medium">Área (m²)</Label>
          <Input id="area" name="area" type="number" value={formData.area} onChange={handleChange} placeholder="Ex: 120"/>
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-2">
        <Label htmlFor="location" className="font-medium">Localização</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Moema, São Paulo - SP" required/>
      </div>

      {/* Imagem Principal + Imagens Extras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
        <div className="space-y-2">
          <Label className="font-medium">Imagem Principal</Label>
          <Input type="file" accept="image/*" onChange={(e) => setMainImage(e.target.files?.[0] || null)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          {mainImage && (
            <img src={URL.createObjectURL(mainImage)} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-md border"/>
          )}
        </div>
        <div className="space-y-2">
          <Label className="font-medium">Imagens Adicionais (Galeria)</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => setGalleryImages(e.target.files)} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          <div className="mt-4 flex flex-wrap gap-2">
            {galleryImages && Array.from(galleryImages).map((file, i) => (
                <img key={i} src={URL.createObjectURL(file)} alt={`Extra ${i}`} className="w-24 h-24 object-cover rounded-md border"/>
              ))}
          </div>
        </div>
      </div>

      {/* Google Maps e Descrição */}
      <div className="space-y-6 pt-4 border-t border-gray-100">
        <div className="space-y-2">
            <Label htmlFor="mapUrl" className="font-medium">URL do Google Maps (Embed)</Label>
            <Input id="mapUrl" name="mapUrl" value={formData.mapUrl || ""} onChange={handleChange} placeholder="Cole o código de incorporação do Google Maps aqui"/>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description" className="font-medium">Descrição Completa do Imóvel</Label>
            <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} className="min-h-[150px]" placeholder="Descreva os detalhes, diferenciais e informações importantes sobre o imóvel."/>
        </div>
      </div>
      
      {/* Botão e Erro */}
      {error && (
        <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
      )}
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="min-w-[150px]">
          {loading ? "Salvando..." : property ? "Salvar Alterações" : "Cadastrar Imóvel"}
        </Button>
      </div>
    </form>
  );
}