'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getLeads,
  deleteLead,
  createLead,
  updateLead,
  Lead,
} from '../../../../../services/api'
import { PlusCircle, Trash2, Users, Edit, ArrowLeft } from 'lucide-react'
import LeadModal from '../../../../components/LeadModal'

type LeadFormData = Omit<Lead, 'id' | 'criadoEm'>

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null)

  const [expandedLeadId, setExpandedLeadId] = useState<number | null>(null)


  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    try {
      setLoading(true)
      const res = await getLeads()
      setLeads(res.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar leads:', err)
      setError('Não foi possível carregar os leads.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setLeadToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (lead: Lead) => {
    setLeadToEdit(lead)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        await deleteLead(id)
        setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id))
      } catch (err) {
        console.error('Erro ao excluir lead:', err)
        alert('Falha ao excluir o lead.')
      }
    }
  }

  const handleSaveLead = async (formData: LeadFormData) => {
    if (leadToEdit) {
      if (!leadToEdit.id) return
      const res = await updateLead(leadToEdit.id, formData)
      setLeads((prevLeads) =>
        prevLeads.map((l) => (l.id === leadToEdit.id ? res.data : l))
      )
    } else {
      const res = await createLead(formData)
      setLeads((prevLeads) => [res.data, ...prevLeads])
    }
  }

  if (loading) return <p className="p-10">Carregando leads...</p>
  if (error) return <p className="p-10 text-red-600">{error}</p>

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/crm"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Voltar ao Painel"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              CRM - Leads
            </h1>
          </div>

          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
            onClick={handleOpenCreateModal}
          >
            <PlusCircle className="w-5 h-5" />
            Novo Lead
          </button>
        </div>

        {leads.length === 0 && !loading && (
          <p className="text-center text-gray-500">Nenhum lead encontrado.</p>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white p-5 shadow-lg rounded-xl border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${lead.status === 'Novo'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {lead.status}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {lead.nome}
                </h2>
                <p className="text-sm text-gray-600">{lead.email}</p>
                <p className="text-sm text-gray-600 mb-2">{lead.telefone}</p>

                {lead.interesse && (
                  <p className="text-sm font-medium text-gray-700">
                    Interesse: <strong>{lead.interesse}</strong>
                  </p>
                )}

                {lead.property && (
                  <p className="mt-1 text-sm text-gray-700">
                    🏠 Propriedade: <strong>{lead.property.title}</strong>
                  </p>
                )}

                {lead.descricao && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {expandedLeadId === lead.id
                        ? lead.descricao
                        : lead.descricao.length > 100
                          ? `${lead.descricao.substring(0, 100)}...`
                          : lead.descricao}
                    </p>

                    {lead.descricao.length > 100 && (
                      <button
                        onClick={() =>
                          setExpandedLeadId(
                            expandedLeadId === lead.id ? null : (lead.id ?? null)
                          )
                        }
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        {expandedLeadId === lead.id ? 'Ler menos' : 'Ler mais'}
                      </button>
                    )}
                  </div>
                )}


              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t">
                <button
                  onClick={() => handleOpenEditModal(lead)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => lead.id && handleDelete(lead.id)}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead as unknown as (lead: any) => Promise<void>}
        leadToEdit={leadToEdit}
      />
    </>
  )
}