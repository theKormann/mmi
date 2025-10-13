"use client";

import Link from "next/link";
import PropertyForm from "../../../components/PropertyForm";
import { PlusCircle, Home } from "lucide-react";
import { useAuthGuard } from "../../../../hooks/AuthGuard";

export default function NewPropertyPage() {
  useAuthGuard(); // 🔐 Protege a página

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-100 p-3 rounded-full">
          <PlusCircle className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Cadastrar Novo Imóvel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Preencha as informações abaixo para adicionar um novo imóvel ao sistema.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors border"
        >
          <Home className="w-4 h-4" />
          Voltar para Dashboard
        </Link>
      </div>

      <PropertyForm />
    </div>
  );
}
