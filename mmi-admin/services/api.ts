// services/api.ts

import axios from "axios";

// ===================================================
// 🏠 PROPRIEDADES
// ===================================================

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
  transactionType: "VENDA" | "LOCACAO" | "VENDA_E_LOCACAO";
  images?: PropertyImage[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- PROPERTIES ---
const propertiesApi = axios.create({
  baseURL: `${API_BASE_URL}/api/properties`,
});

export const getProperties = () => propertiesApi.get<Property[]>("");

export const getPropertyById = (id: number) =>
  propertiesApi.get<Property>(`/${id}`);

export const createProperty = async (
  propertyData: Omit<Property, "id" | "image" | "images">,
  mainImage: File,
  galleryFiles?: File[]
) => {
  const formData = new FormData();

  formData.append(
    "property",
    new Blob([JSON.stringify(propertyData)], { type: "application/json" })
  );
  formData.append("mainImage", mainImage);

  if (galleryFiles && galleryFiles.length > 0) {
    galleryFiles.forEach((file) => formData.append("gallery", file));
  }

  return propertiesApi.post("", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProperty = (id: number, data: Omit<Property, "id">) =>
  propertiesApi.put(`/${id}`, data);

export const deleteProperty = (id: number) => propertiesApi.delete(`/${id}`);

// ===================================================
// 🤝 CRM (LEADS)
// ===================================================

export interface Lead {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  status: "Novo" | "Em contato" | "Visitou" | "Negociação" | "Fechado";
  interesse: "Comprar" | "Alugar" | "Vender";
  propertyId?: number;
  descricao?: string;
  property?: {
    id: number;
    title: string;
    location: string;
  };
  criadoEm?: string;
}

const crmApi = axios.create({
  baseURL: `${API_BASE_URL}/api/leads`,
});

export const getLeads = () => crmApi.get<Lead[]>("");

export const getLeadById = (id: number) => crmApi.get<Lead>(`/${id}`);

export const createLead = (leadData: Omit<Lead, "id" | "criadoEm" | "property">) =>
  crmApi.post("", leadData);

export const updateLead = (id: number, leadData: Partial<Lead>) =>
  crmApi.put(`/${id}`, leadData);

export const deleteLead = (id: number) => crmApi.delete(`/${id}`);

export const associateLeadToProperty = (leadId: number, propertyId: number) =>
  crmApi.put(`/${leadId}`, { propertyId });

export const getLeadsByProperty = (propertyId: number) =>
  crmApi.get<Lead[]>(`/property/${propertyId}`);

// ===================================================
// 📜 CONTRATOS (CLÁUSULAS)
// ===================================================

export interface Clause {
  id?: number;
  title: string;
  content: string;
}

const clausesApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const deleteContract = (uuid: string) => {
  return clausesApi.delete(`/contracts/${uuid}`);
};

export const updateContract = (uuid: string, title: string) => {
  return clausesApi.put(`/contracts/${uuid}`, { title });
};

export const getClauses = () => clausesApi.get<Clause[]>("/clauses");

export const createClause = (data: Omit<Clause, "id">) =>
  clausesApi.post("/clauses", data);

export const updateClause = (id: number, data: Omit<Clause, "id">) =>
  clausesApi.put(`/clauses/${id}`, data);

export const deleteClause = (id: number) =>
  clausesApi.delete(`/clauses/${id}`);

export const generateContractPDF = (clauses: Clause[]) =>
  clausesApi.post("/clauses/pdf", clauses, {
    responseType: "blob", 
  });
