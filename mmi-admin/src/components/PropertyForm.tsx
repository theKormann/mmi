"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Property, PropertyImage as PropertyImageType } from "../../services/api";
import axios from "axios";
import { AlertCircle, UploadCloud, Trash2, Loader2 } from "lucide-react";

type ImageSource = {
  id?: number;
  url: string;
  file?: File;
};

// --- Constantes ---
const propertyTypes: Property["type"][] = ["Apartamento", "Casa", "Cobertura", "Terreno", "Comercial", "Rural"];
const transactionTypes: ("VENDA" | "LOCACAO")[] = ["VENDA", "LOCACAO"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// --- Componente Auxiliar para Upload de Imagens ---
const ImageUploadField = ({
  label,
  onFileChange,
  multiple = false,
  existingImages = [],
  onRemoveExisting,
}: {
  label: string;
  onFileChange: (files: File[]) => void;
  multiple?: boolean;
  existingImages?: ImageSource[];
  onRemoveExisting?: (id: number) => void;
}) => {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<ImageSource[]>([]);

  useEffect(() => {
    const newFilePreviews = newFiles.map(file => ({ url: URL.createObjectURL(file), file }));
    const allPreviews = [...existingImages, ...newFilePreviews];
    setPreviews(allPreviews);

    return () => {
      newFilePreviews.forEach(p => URL.revokeObjectURL(p.url));
    };
  }, [newFiles, existingImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const addedFiles = Array.from(e.target.files);
      const updatedFiles = multiple ? [...newFiles, ...addedFiles] : addedFiles;
      setNewFiles(updatedFiles);
      onFileChange(updatedFiles);
    }
  };

  const removeFile = (itemToRemove: ImageSource) => {
    if (itemToRemove.id && onRemoveExisting) {
      onRemoveExisting(itemToRemove.id);
    } else {
      const updatedFiles = newFiles.filter(f => f !== itemToRemove.file);
      setNewFiles(updatedFiles);
      onFileChange(updatedFiles);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-semibold text-gray-700">{label}</Label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Arraste e solte ou clique para selecionar</p>
        <p className="text-xs text-gray-500">{multiple ? 'Múltiplas imagens' : 'Apenas 1 imagem'}</p>
        <Input type="file" accept="image/*" multiple={multiple} onChange={handleFileChange} className="sr-only" id={`file-upload-${label}`} />
        <label htmlFor={`file-upload-${label}`} className="absolute inset-0 cursor-pointer"></label>
      </div>
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {previews.map((item, index) => (
            <div key={item.id || index} className="relative group aspect-square">
              <img src={item.url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md border" />
              <button type="button" onClick={() => removeFile(item)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Componente Principal do Formulário ---
export default function PropertyForm({ property }: { property?: Property }) {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<Property, "id" | "images">>({
      title: "", type: "Casa", transactionType: "VENDA", price: 100000,
      bedrooms: 1, bathrooms: 1, garages: 1, area: 50, location: "",
      description: "", mapUrl: "", image: "", handle: ""
  });
  
  const [existingGallery, setExistingGallery] = useState<ImageSource[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newMainImageFile, setNewMainImageFile] = useState<File[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (property) {
      setFormData({ ...property });
      setExistingGallery(property.images?.map(img => ({ id: img.id, url: img.url })) || []);
    }
  }, [property]);

  const handleRemoveExistingGalleryImage = (idToRemove: number) => {
    setExistingGallery(prev => prev.filter(img => img.id !== idToRemove));
    setImagesToDelete(prev => [...prev, idToRemove]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (property?.id) {
        if (imagesToDelete.length > 0) {
          await axios.delete(`${API_URL}/api/properties/images`, { data: imagesToDelete });
        }
        const uploadData = new FormData();
        let hasNewImages = false;
        if (newMainImageFile.length > 0) {
          uploadData.append("mainImage", newMainImageFile[0]);
          hasNewImages = true;
        }
        if (newGalleryFiles.length > 0) {
          newGalleryFiles.forEach(file => uploadData.append("gallery", file));
          hasNewImages = true;
        }
        if (hasNewImages) {
          await axios.post(`${API_URL}/api/properties/${property.id}/images`, uploadData);
        }
        await axios.put(`${API_URL}/api/properties/${property.id}`, formData);
        alert("Imóvel atualizado com sucesso!");
      } else {
        // --- LÓGICA DE CRIAÇÃO ---
        if (newMainImageFile.length === 0) {
            setError("A imagem principal é obrigatória.");
            setLoading(false);
            return;
        }
        const createData = new FormData();
        createData.append("property", new Blob([JSON.stringify(formData)], { type: "application/json" }));
        createData.append("mainImage", newMainImageFile[0]);
        if (newGalleryFiles.length > 0) {
            newGalleryFiles.forEach(file => createData.append("gallery", file));
        }
        await axios.post(`${API_URL}/api/properties`, createData);
        alert("Imóvel cadastrado com sucesso!");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Erro ao salvar.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: ["price", "bedrooms", "bathrooms", "garages", "area"].includes(name) ? Number(value) : value}));
  };
  
  const handleSelectChange = (name: 'type' | 'transactionType') => (value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>Defina o título, valor e o tipo de transação do imóvel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Anúncio</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Apartamento com vista para o parque" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Finalidade</Label>
              <Select value={formData.transactionType} onValueChange={handleSelectChange('transactionType')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{transactionTypes.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* --- Card: Detalhes do Imóvel --- */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Imóvel</CardTitle>
          <CardDescription>Especifique as características principais como quartos, banheiros e área.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tipo de Imóvel</Label>
            <Select value={formData.type} onValueChange={handleSelectChange('type')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{propertyTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input id="bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input id="bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="garages">Vagas</Label>
              <Input id="garages" name="garages" type="number" value={formData.garages} onChange={handleChange} min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Área (m²)</Label>
              <Input id="area" name="area" type="number" value={formData.area} onChange={handleChange} min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Card: Localização e Descrição --- */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Descrição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="location">Endereço / Localização</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Ex: Moema, São Paulo - SP" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mapUrl">URL do Google Maps (Embed)</Label>
            <Input id="mapUrl" name="mapUrl" value={formData.mapUrl || ""} onChange={handleChange} placeholder="Cole o código de incorporação do Google Maps" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="description">Descrição Completa</Label>
            <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} className="min-h-[150px]" placeholder="Descreva os detalhes e diferenciais do imóvel." />
          </div>
        </CardContent>
      </Card>
      
      {/* --- Card: Mídia --- */}
      <Card>
        <CardHeader>
          <CardTitle>Mídia</CardTitle>
          <CardDescription>Adicione ou remova a imagem de capa e as fotos da galeria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploadField 
            label="Imagem Principal" 
            onFileChange={setNewMainImageFile}
            existingImages={property?.image ? [{ id: property.id, url: property.image }] : []}
            onRemoveExisting={() => alert("Para alterar a imagem principal, basta enviar uma nova.")}
          />
          <ImageUploadField 
            label="Imagens da Galeria" 
            onFileChange={setNewGalleryFiles}
            multiple 
            existingImages={existingGallery}
            onRemoveExisting={handleRemoveExistingGalleryImage}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 text-sm font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
        </div>
      )}
      
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading} size="lg" className="min-w-[180px]">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : (property ? "Salvar Alterações" : "Cadastrar Imóvel")}
        </Button>
      </div>
    </form>
  );
}