'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProperties, deleteProperty, Property } from '../../../services/api';
// Importe o 'Users' e o 'Briefcase'
import {
  PlusCircle,
  Edit,
  Trash2,
  Home,
  Users,
  Briefcase, // <-- ÍCONE ADICIONADO
} from 'lucide-react';

export default function AdminDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProperties() {
    try {
      const response = await getProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
      alert('Não foi possível carregar os imóveis.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  async function handleDelete(id: number) {
    if (
      window.confirm(
        'Tem certeza que deseja excluir este imóvel? A ação não pode ser desfeita.'
      )
    ) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter((p) => p.id !== id));
        alert('Imóvel excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
        alert('Falha ao excluir o imóvel.');
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center text-gray-500 animate-pulse">
          <Home className="w-10 h-10 mb-2" />
          <p className="text-lg font-medium">Carregando imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
          <Home className="w-7 h-7 text-blue-600" />
          Painel de Imóveis
        </h1>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          
          <Link
            href="/admin/erp"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Briefcase className="w-5 h-5" />
            Acessar ERP
          </Link>

          <Link
            href="/admin/crm"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Users className="w-5 h-5" />
            Acessar CRM
          </Link>

          <Link
            href="/admin/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            Adicionar Imóvel
          </Link>
        </div>
      </div>

      {/* Lista */}
      {properties.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>Nenhum imóvel cadastrado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white shadow-md hover:shadow-lg rounded-2xl p-5 transition-all duration-200 border border-gray-100 flex flex-col" // Adicionado flex flex-col
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {prop.title}
                </h2>
                <p className="text-sm text-gray-500">{prop.type}</p>
              </div>

              <p className="text-xl font-bold text-blue-600 mb-5">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(prop.price)}
              </p>

              {/* Botões alinhados na parte inferior */}
              <div className="flex items-center justify-between mt-auto">
                <Link
                  href={`/admin/edit/${prop.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(prop.id!)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}