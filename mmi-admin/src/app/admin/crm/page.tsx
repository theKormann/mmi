'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  Home,
  PlusCircle,
  Building,
  Fingerprint, 
} from 'lucide-react'

export default function CRMDashboard() {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin"
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar ao Painel Admin"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" />
          Painel CRM
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Link
          href="/admin/crm/lead"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gestão de Leads
          </h2>
          <p className="text-gray-600">
            Acesse, crie e gerencie todos os clientes interessados.
          </p>
        </Link>

        <Link
          href="/admin/crm/cookies" 
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-4">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Rastreamento
          </h2>
          <p className="text-gray-600">
            Visualize os "crachás" e a atividade dos visitantes do site.
          </p>
        </Link>
        {/* ================================================ */}
        {/* == FIM DO NOVO CARD == */}
        {/* ================================================ */}

        {/* Card 3: Captação de Imóveis */}
        <Link
          href="/admin/crm/c" // (Você talvez queira checar este link, parece incompleto)
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Captação de Imóveis
          </h2>
          <p className="text-gray-600">
            Encontre imóveis para adicionar ao catálogo.
          </p>
        </Link>

        {/* Card 4: Ver Imóveis */}
        <Link
          href="/admin"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-gray-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 text-gray-600 rounded-full mb-4">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ver Imóveis Cadastrados
          </h2>
          <p className="text-gray-600">
            Visualize os imóveis já cadastrados no sistema.
          </p>
        </Link>
      </div>
    </div>
  )
}