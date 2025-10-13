"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getPropertyById } from "../../../../../services/api";
import PropertyForm from "../../../../components/PropertyForm";
import { Home, AlertTriangle, ArrowLeft, LogOut } from "lucide-react";
import { useAuthGuard } from "../../../../../hooks/AuthGuard";

export default function EditPropertyPage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [property, setProperty] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Autenticação de admin
  useEffect(() => {
    const isAuthenticated =
      localStorage.getItem("admin-auth") === "true" ||
      document.cookie.includes("admin-auth=true");

    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    // 🔄 Buscar imóvel após autenticação
    const fetchData = async () => {
      try {
        const response = await getPropertyById(Number(id));
        setProperty(response.data);
      } catch (err) {
        setError("Imóvel não encontrado");
      }
    };

    fetchData();
  }, [id, router]);

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-red-600">
          {error}
        </h1>
        <p className="text-gray-600 mt-2">
          O imóvel com o ID <span className="font-semibold">{id}</span> não existe ou foi removido.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Dashboard
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-500">
        Carregando imóvel...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Home className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Editar Imóvel
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atualize as informações de{" "}
              <span className="font-semibold text-gray-700">{property.title}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>

      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Dashboard
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-gray-100">
        <PropertyForm property={property} />
      </div>
    </div>
  );
}
