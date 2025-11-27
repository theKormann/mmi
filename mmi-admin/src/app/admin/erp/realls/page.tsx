'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import axios from 'axios'
import {
  Building2,
  MapPin,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  Home,
  DollarSign,
  CalendarRange,
  User,
  Key,
  Tag,
  MoreHorizontal,
  Edit2,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react'

// --- TIPOS ---
interface RealProperty {
  id?: number
  title: string
  address: string
  type: 'RENT' | 'SALE'
  status: 'AVAILABLE' | 'OCCUPIED' | 'SOLD'
  price: number
  tenantName?: string
  contractStart?: string
  contractEnd?: string
  description?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// --- HELPER COMPONENTS ---

const StatusBadge = ({ status, type }: { status: string, type: string }) => {
  if (status === 'SOLD') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Vendido</span>
  }
  if (status === 'OCCUPIED') {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{type === 'RENT' ? 'Alugado' : 'Em Processo'}</span>
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">Disponível</span>
}

const ProgressBar = ({ start, end }: { start?: string, end?: string }) => {
  if (!start || !end) return null
  
  const startDate = new Date(start).getTime()
  const endDate = new Date(end).getTime()
  const today = new Date().getTime()
  
  const total = endDate - startDate
  const current = today - startDate
  
  // Calcula porcentagem (min 0, max 100)
  let percentage = Math.round((current / total) * 100)
  percentage = Math.max(0, Math.min(100, percentage))

  // Dias restantes
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Contrato</span>
        <span className={daysLeft < 30 ? "text-red-600 font-bold" : ""}>{daysLeft > 0 ? `${daysLeft} dias restantes` : 'Vencido'}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${daysLeft < 30 ? 'bg-red-500' : 'bg-blue-600'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

// --- MODAL DE CADASTRO ---
const PropertyModal = ({ isOpen, onClose, onSave, propertyToEdit }: any) => {
  const [formData, setFormData] = useState<RealProperty>({
    title: '', address: '', type: 'RENT', status: 'AVAILABLE', price: 0, tenantName: '', contractStart: '', contractEnd: '', description: ''
  })

  useEffect(() => {
    if (propertyToEdit) {
      setFormData(propertyToEdit)
    } else {
      setFormData({ title: '', address: '', type: 'RENT', status: 'AVAILABLE', price: 0, tenantName: '', contractStart: '', contractEnd: '', description: '' })
    }
  }, [propertyToEdit, isOpen])

  const handleChange = (field: keyof RealProperty, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {propertyToEdit ? <Edit2 className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            {propertyToEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Título do Imóvel</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="Ex: Apto Jardins - 3 Quartos" />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Endereço Completo</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" className="w-full border rounded-lg pl-9 pr-3 py-2" value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="Rua, Número, Bairro..." />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de Negócio</label>
            <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.type} onChange={e => handleChange('type', e.target.value)}>
              <option value="RENT">Aluguel</option>
              <option value="SALE">Venda</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status Atual</label>
            <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
              <option value="AVAILABLE">Disponível</option>
              <option value="OCCUPIED">{formData.type === 'RENT' ? 'Alugado' : 'Vendido/Reservado'}</option>
              <option value="SOLD">Vendido (Finalizado)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 text-sm">R$</span>
              <input type="number" className="w-full border rounded-lg pl-9 pr-3 py-2" value={formData.price} onChange={e => handleChange('price', Number(e.target.value))} />
            </div>
          </div>

          {formData.status === 'OCCUPIED' && (
            <>
              <div className="md:col-span-2 border-t my-2"></div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2"><User className="w-4 h-4"/> Dados do Contrato</h4>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Inquilino/Comprador</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.tenantName} onChange={e => handleChange('tenantName', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Início do Contrato</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2" value={formData.contractStart} onChange={e => handleChange('contractStart', e.target.value)} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fim do Contrato</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2" value={formData.contractEnd} onChange={e => handleChange('contractEnd', e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8 border-t pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">Salvar Imóvel</button>
        </div>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---

export default function RealEstatePage() {
  const [properties, setProperties] = useState<RealProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState<RealProperty | null>(null)
  const [filter, setFilter] = useState('ALL') // ALL, RENT, SALE

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/api/realls`)
      setProperties(res.data)
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: RealProperty) => {
    try {
      if (data.id) {
        await axios.put(`${API_URL}/api/realls/${data.id}`, data)
      } else {
        await axios.post(`${API_URL}/api/realls`, data)
      }
      setIsModalOpen(false)
      fetchProperties()
    } catch (error) {
      alert('Erro ao salvar imóvel.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este imóvel?")) return
    try {
      await axios.delete(`${API_URL}/api/realls/${id}`)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      alert('Erro ao deletar.')
    }
  }

  // KPIs
  const kpis = useMemo(() => {
    const total = properties.length
    const occupied = properties.filter(p => p.status === 'OCCUPIED').length
    const revenue = properties
      .filter(p => p.status === 'OCCUPIED' && p.type === 'RENT')
      .reduce((acc, curr) => acc + (curr.price || 0), 0)
    return { total, occupied, revenue }
  }, [properties])

  const filteredProperties = properties.filter(p => filter === 'ALL' || p.type === filter)

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/erp" className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Gestão Imobiliária
              </h1>
            </div>
          </div>
          <button onClick={() => { setPropertyToEdit(null); setIsModalOpen(true) }} className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Imóvel</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total de Imóveis</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Home className="w-5 h-5"/></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {kpis.total > 0 ? Math.round((kpis.occupied / kpis.total) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600"><Key className="w-5 h-5"/></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Receita Mensal (Aluguel)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.revenue)}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600"><DollarSign className="w-5 h-5"/></div>
          </div>
        </div>

        {/* FILTROS E LISTAGEM */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Todos</button>
          <button onClick={() => setFilter('RENT')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'RENT' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Aluguel</button>
          <button onClick={() => setFilter('SALE')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'SALE' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Venda</button>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-gray-900 font-medium">Nenhum imóvel encontrado</h3>
            <p className="text-gray-500 text-sm">Adicione novos imóveis para começar a gerenciar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProperties.map(property => (
              <div key={property.id} className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col overflow-hidden">
                
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className={`w-3.5 h-3.5 ${property.type === 'RENT' ? 'text-blue-600' : 'text-purple-600'}`} />
                      <span className={`text-xs font-bold tracking-wide uppercase ${property.type === 'RENT' ? 'text-blue-700' : 'text-purple-700'}`}>
                        {property.type === 'RENT' ? 'Aluguel' : 'Venda'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-1" title={property.title}>{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                  </div>
                  <StatusBadge status={property.status} type={property.type} />
                </div>

    
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-xs text-gray-500 uppercase">Valor</span>
                      <p className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                        {property.type === 'RENT' && <span className="text-xs font-normal text-gray-500">/mês</span>}
                      </p>
                    </div>
                  </div>

                  {property.status === 'OCCUPIED' && property.type === 'RENT' && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {property.tenantName || 'Inquilino'}
                      </div>
                      <ProgressBar start={property.contractStart} end={property.contractEnd} />
                      <div className="flex justify-between mt-2 text-[10px] text-gray-400 uppercase">
                        <span>{property.contractStart ? new Date(property.contractStart).toLocaleDateString() : '-'}</span>
                        <span>{property.contractEnd ? new Date(property.contractEnd).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>
                  )}
                  
                  {property.status === 'OCCUPIED' && property.type === 'SALE' && (
                     <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2 text-green-800 text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Negociação em andamento com {property.tenantName}
                     </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setPropertyToEdit(property); setIsModalOpen(true) }} 
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors" 
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(property.id!)} 
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors" 
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PropertyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        propertyToEdit={propertyToEdit}
      />
    </div>
  )
}