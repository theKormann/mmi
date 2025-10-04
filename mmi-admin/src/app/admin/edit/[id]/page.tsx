import Link from "next/link";
import PropertyForm from "../../../../components/PropertyForm";
import { getPropertyById } from "../../../../../services/api";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

// Server Component — busca dados antes de renderizar
export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const response = await getPropertyById(Number(id));
    const property = response.data;

    return (
      <div className="container mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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

        {/* Botão Voltar */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Dashboard
          </Link>
        </div>

        {/* Card do formulário */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-gray-100">
          <PropertyForm property={property} />
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-red-600">
          Imóvel não encontrado
        </h1>
        <p className="text-gray-600 mt-2">
          O imóvel com o ID <span className="font-semibold">{id}</span> não existe ou foi removido.
        </p>
        <p className="text-gray-500 mt-1 text-sm">
          Verifique se o ID está correto ou volte à lista de imóveis.
        </p>

        {/* Botão Voltar */}
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
}
