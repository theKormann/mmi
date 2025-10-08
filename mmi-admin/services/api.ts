// services/api.ts

import axios from "axios";

// ✅ Interface separada para clareza e reusabilidade
export interface PropertyImage {
  id: number;
  url: string;
}

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
  
  images?: PropertyImage[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/properties`,
});

export const getProperties = () => api.get<Property[]>("");

export const getPropertyById = (id: number) => api.get<Property>(`/${id}`);

export const createProperty = async (
  propertyData: Omit<Property, "id" | "image" | "images">,
  mainImage: File,
  galleryFiles?: File[]
) => {
  const formData = new FormData();

  formData.append("property", new Blob([JSON.stringify(propertyData)], { type: "application/json" }));
  formData.append("mainImage", mainImage);

  if (galleryFiles && galleryFiles.length > 0) {
    galleryFiles.forEach((file) => formData.append("gallery", file));
  }

  return api.post("", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProperty = (id: number, data: Omit<Property, "id">) =>
  api.put(`/${id}`, data);

export const deleteProperty = (id: number) => api.delete(`/${id}`);