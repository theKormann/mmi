'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProperties, deleteProperty, Property } from '../../../services/api';
import {
  PlusCircle,
  Edit,
  Trash2,
  Home,
  Users,
  Briefcase,
  ImageIcon
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
        // O Toast de sucesso seria perfeito aqui futuramente
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
        <div className="flex flex-col items-center text-slate-400 animate-pulse">
          <Home className="w-10 h-10 mb-2" />
          <p className="text-lg font-medium">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            Gestão de Imóveis
          </h1>
          <p className="text-slate-500 mt-1 ml-11">Gerencie seu catálogo, clientes e contratos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin/erp"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            <Briefcase className="w-4 h-4" />
            ERP
          </Link>

          <Link
            href="/admin/crm"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200"
          >
            <Users className="w-4 h-4" />
            CRM
          </Link>

          <Link
            href="/admin/new"
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5" />
            Novo Imóvel
          </Link>
        </div>
      </div>

      {/* GRID DE IMÓVEIS */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400 mt-10">
          <Home className="w-12 h-12 mb-3 text-slate-300" />
          <p className="text-lg">Nenhum imóvel cadastrado no catálogo.</p>
          <Link href="/admin/new" className="mt-4 text-blue-600 font-medium hover:underline">
            Cadastrar o primeiro imóvel
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((prop) => {
            
            // Lógica para pegar a primeira imagem de forma segura
            // Assume que 'images' pode ser um array de objetos ou strings na sua API
            let mainImage = null;
            if (prop.images && prop.images.length > 0) {
              const firstImg = prop.images[0];
              mainImage = typeof firstImg === 'string' ? firstImg : firstImg.url;
            }

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-all duration-300 flex flex-col group"
              >
                {/* ÁREA DA IMAGEM */}
                <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage}
                      alt={prop.title || 'Foto do imóvel'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-xs font-medium">Sem imagem</span>
                    </div>
                  )}
                  
                  {/* Badge do tipo flutuando sobre a imagem */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                    {prop.type || 'Imóvel'}
                  </div>
                </div>

                {/* CORPO DO CARD */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-800 line-clamp-1 mb-1" title={prop.title}>
                      {prop.title}
                    </h2>
                  </div>

                  <div className="mb-5 mt-auto">
                    <p className="text-2xl font-black text-slate-800 tracking-tight">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        maximumFractionDigits: 0 // Deixa o valor mais limpo tirando os centavos se forem ,00
                      }).format(prop.price)}
                    </p>
                  </div>

                  {/* RODAPÉ E BOTÕES DE AÇÃO */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <Link
                      href={`/admin/edit/${prop.id}`}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>

                    <button
                      onClick={() => handleDelete(prop.id!)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-500 font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}