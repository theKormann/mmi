'use client'

import { useEffect, useState } from 'react'
import { Lead, getProperties, Property } from '../../services/api'
import { X } from 'lucide-react'

type LeadFormData = Omit<Lead, 'id' | 'criadoEm' | 'property'>

interface LeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (lead: LeadFormData) => Promise<void>
  leadToEdit: Lead | null
}

const STATUS_OPTIONS: Lead['status'][] = [
  'Novo',
  'Em contato',
  'Visitou',
  'Negociação',
  'Fechado',
]

const INTERESSE_OPTIONS: Lead['interesse'][] = ['Comprar', 'Alugar', 'Vender']

export default function LeadModal({
  isOpen,
  onClose,
  onSave,
  leadToEdit,
}: LeadModalProps) {
  const getInitialData = (): LeadFormData => ({
    nome: leadToEdit?.nome ?? '',
    email: leadToEdit?.email ?? '',
    telefone: leadToEdit?.telefone ?? '',
    status: leadToEdit?.status ?? 'Novo',
    interesse: leadToEdit?.interesse ?? 'Comprar',
    origem: leadToEdit?.origem ?? 'Site',
    descricao: leadToEdit?.descricao ?? '',
    propertyId: leadToEdit?.property?.id,
  })

  const [formData, setFormData] = useState<LeadFormData>(getInitialData())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialData())
      getProperties().then((res) => setProperties(res.data))
    }
  }, [isOpen, leadToEdit])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'propertyId' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar lead:', error)
      alert('Falha ao salvar lead. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-2xl font-semibold">
          {leadToEdit ? 'Editar Lead' : 'Novo Lead'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium">
              Nome
            </label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full rounded-md border p-2"
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label
                htmlFor="telefone"
                className="mb-1 block text-sm font-medium"
              >
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
                className="w-full rounded-md border p-2"
              />
            </div>
          </div>

          {/* Status e Interesse */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border bg-white p-2"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="interesse"
                className="mb-1 block text-sm font-medium"
              >
                Interesse
              </label>
              <select
                id="interesse"
                name="interesse"
                value={formData.interesse}
                onChange={handleChange}
                className="w-full rounded-md border bg-white p-2"
              >
                {INTERESSE_OPTIONS.map((interesse) => (
                  <option key={interesse} value={interesse}>
                    {interesse}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Imóvel */}
          <div>
            <label
              htmlFor="propertyId"
              className="mb-1 block text-sm font-medium"
            >
              Imóvel de Interesse
            </label>
            <select
              id="propertyId"
              name="propertyId"
              value={formData.propertyId ?? ''}
              onChange={handleChange}
              className="w-full rounded-md border bg-white p-2"
              required
            >
              <option value="">Selecione um imóvel...</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.location}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Descrição com Ler mais */}
          <div>
            <label
              htmlFor="descricao"
              className="mb-1 block text-sm font-medium"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full rounded-md border p-2 min-h-[100px]"
              placeholder="Adicione observações ou detalhes sobre o lead..."
            />
            {formData.descricao && formData.descricao.length > 100 && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-1 text-blue-600 text-sm hover:underline"
              >
                {expanded ? 'Ler menos' : 'Ler mais'}
              </button>
            )}
            {expanded && (
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                {formData.descricao}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSubmitting
                ? 'Salvando...'
                : leadToEdit
                ? 'Salvar Alterações'
                : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
