import axios from "axios";

export interface Property {
  id?: number;
  title: string;
  price: number;
  image?: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  handle: string;
  mapUrl?: string;
  description?: string;
  type: "Apartamento" | "Casa" | "Cobertura" | "Terreno" | "Comercial" | "Rural";
  transactionType: "VENDA" | "LOCACAO";
  images?: { id: number; url: string }[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/properties`,
});

// 📦 Listar todos
export const getProperties = () => api.get<Property[]>("");

// 🔍 Buscar por ID
export const getPropertyById = (id: number) => api.get<Property>(`/${id}`);

// 🏗️ Criar imóvel (com imagem principal + galeria)
export const createProperty = async (
  propertyData: Omit<Property, "id" | "image" | "images">,
  mainImage: File,
  galleryFiles?: File[]
) => {
  const formData = new FormData();

  // adicionar JSON do imóvel
  formData.append("property", new Blob([JSON.stringify(propertyData)], { type: "application/json" }));

  // imagem principal
  formData.append("mainImage", mainImage);

  // galeria
  if (galleryFiles && galleryFiles.length > 0) {
    galleryFiles.forEach((file) => formData.append("gallery", file));
  }

  return api.post("", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✏️ Atualizar (sem upload)
export const updateProperty = (id: number, data: Omit<Property, "id">) =>
  api.put(`/${id}`, data);

// 🗑️ Deletar
export const deleteProperty = (id: number) => api.delete(`/${id}`);
