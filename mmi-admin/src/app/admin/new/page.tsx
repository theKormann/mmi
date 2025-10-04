import Link from "next/link";
import PropertyForm from "../../../components/PropertyForm";
import { PlusCircle, Home } from "lucide-react";

export default function NewPropertyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <PlusCircle className="w-7 h-7 text-blue-600" />
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
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          Voltar para Dashboard
        </Link>
      </div>

      {/* Card do formulário */}
      <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 border border-gray-100">
        <PropertyForm />
      </div>
    </div>
  );
}
