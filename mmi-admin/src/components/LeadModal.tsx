'use client'

import { useEffect, useState } from 'react'
import { Lead, getProperties, Property } from '../../services/api' 
import { X, Loader2, Save } from 'lucide-react'

type LeadFormData = Omit<Lead, 'id' | 'criadoEm' | 'property' | 'propertyId'> & {
  propertyId: number | null
}

interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (lead: LeadFormData) => Promise<void>
  leadToEdit: Lead | null
}

const STATUS_OPTIONS = [
  'Novo',
  'Em contato',
  'Visitou',
  'Proposta',
  'Negociação',
  'Fechado',
  'Perdido',
] as Lead['status'][]

const INTERESSE_OPTIONS = ['Comprar', 'Alugar', 'Investir'] as unknown as Lead['interesse'][]

export default function LeadModal({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
}: LeadModalProps) {
  
  // Estado inicial do formulário
  const getInitialData = (): LeadFormData => ({
    nome: leadToEdit?.nome ?? '',
    email: leadToEdit?.email ?? '',
    telefone: leadToEdit?.telefone ?? '',
    status: leadToEdit?.status ?? 'Novo',
    interesse: leadToEdit?.interesse ?? 'Comprar',
    origem: leadToEdit?.origem ?? 'Manual',
    descricao: leadToEdit?.descricao ?? '',
    // Se tiver propriedade, pega o ID, senão null
    propertyId: leadToEdit?.property?.id ?? null, 
  })

  const [formData, setFormData] = useState<LeadFormData>(getInitialData())
  const [properties, setProperties] = useState<Property[]>([])
  
  // Estados de controle de UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProps, setIsLoadingProps] = useState(false)

  // Carregar dados ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialData())
      loadProperties()
    }
  }, [isOpen, leadToEdit])

  async function loadProperties() {
    try {
      setIsLoadingProps(true)
      const res = await getProperties()
      setProperties(res.data)
    } catch (error) {
      console.error('Erro ao carregar imóveis', error)
    } finally {
      setIsLoadingProps(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => {
      // Lógica específica para o propertyId
      if (name === 'propertyId') {
        return {
          ...prev,
          // Se for string vazia, vira null. Se tiver valor, vira Number.
          propertyId: value === '' ? null : Number(value)
        }
      }

      // Campos normais
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
      alert('Falha ao salvar lead. Verifique os dados e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header Fixo */}
        <div className="flex items-center justify-between border-b p-5 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {leadToEdit ? 'Editar Lead' : 'Novo Lead'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-semibold text-gray-700">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Ex: João da Silva"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="cliente@email.com"
                value={formData.email}
                onChange={handleChange}
                // Email nem sempre é obrigatório em CRM, ajuste conforme regra de negócio (aqui mantive required do seu código)
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="telefone" className="mb-1 block text-sm font-semibold text-gray-700">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Status e Interesse */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-semibold text-gray-700">
                Status do Funil
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="interesse" className="mb-1 block text-sm font-semibold text-gray-700">
                Tipo de Interesse
              </label>
              <select
                id="interesse"
                name="interesse"
                value={formData.interesse}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {INTERESSE_OPTIONS.map((interesse) => (
                  <option key={interesse} value={interesse}>{interesse}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Imóvel de Interesse (Opcional) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <label htmlFor="propertyId" className="mb-1 block text-sm font-semibold text-gray-700 flex justify-between">
              Imóvel de Interesse
              <span className="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Opcional</span>
            </label>
            
            <div className="relative">
              <select
                id="propertyId"
                name="propertyId"
                // Converte null para string vazia para o value do select
                value={formData.propertyId ?? ''} 
                onChange={handleChange}
                disabled={isLoadingProps}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
              >
                <option value="">-- Lead Geral (Sem imóvel vinculado) --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (Id: {p.id})
                  </option>
                ))}
              </select>
              {isLoadingProps && (
                <div className="absolute right-3 top-3 text-gray-400">
                   <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Vincule este lead a um imóvel específico ou não.
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-semibold text-gray-700">
              Observações / Histórico
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
              placeholder="Digite detalhes importantes sobre o cliente, preferências, horários para contato, etc..."
            />
          </div>

          {/* Botões - Footer Fixo no fim do scroll se necessário */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Salvando...' : (leadToEdit ? 'Salvar Alterações' : 'Criar Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}