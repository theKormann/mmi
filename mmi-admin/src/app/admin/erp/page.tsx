'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Briefcase,
  Home, 
  Users, 
  DollarSign, 
  FileText,
  KeyRound, 
  BarChart3, 
  Zap,
} from 'lucide-react'

export default function ERPDashboard() {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin"
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar ao Painel Admin"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-indigo-600" />
          Painel ERP Imobiliário
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link
          href="/admin/erp/imoveis"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Home className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🏢 Gestão de Imóveis
          </h2>
          <p className="text-gray-600">
            Gerencia todo o portfólio de imóveis, sejam próprios ou de terceiros.
          </p>
        </Link>

        <Link
          href="/admin/crm/lead"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-cyan-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            👥 Clientes e Leads (CRM)
          </h2>
          <p className="text-gray-600">
            Relacionamento e acompanhamento de contatos até o fechamento.
          </p>
        </Link>

        <Link
          href="/admin/erp/financial"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            💰 Gestão Financeira
          </h2>
          <p className="text-gray-600">
            Repasses a proprietários e fluxo de caixa.
          </p>
        </Link>

        <Link
          href="/admin/erp/contratos"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🧾 Gestão de Contratos
          </h2>
          <p className="text-gray-600">
            Geração automática de contratos, assinaturas e controle de prazos.
          </p>
        </Link>

        <Link
          href="/admin/erp/locacoes"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-full mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🏦 Gestão de Locações
          </h2>
          <p className="text-gray-600">
            Administra imóveis alugados e suas operações recorrentes.
          </p>
        </Link>

        <Link
          href="/admin/erp/relatorios"
          className="block p-6 bg-white shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:border-yellow-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full mb-4">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            📊 Relatórios e Análises
          </h2>
          <p className="text-gray-600">
            Visualização de dados estratégicos para tomadas de decisão.
          </p>
        </Link>

      </div>
    </div>
  )
}