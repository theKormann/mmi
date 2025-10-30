'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getClauses,
  deleteClause,
  createClause,
  updateClause,
  Clause,
  generateContractPDF
} from '../../../../../services/api'
import {
  PlusCircle,
  Trash2,
  FileText,
  Edit,
  ArrowLeft,
  FileDown,
  Loader2
} from 'lucide-react'
import ClauseModal from '../../../../components/ClauseModal'
import { AxiosResponse } from 'axios'

type ClauseFormData = Omit<Clause, 'id' | 'createdAt'>

export default function ContractsPage() {
  const [clauses, setClauses] = useState<Clause[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clauseToEdit, setClauseToEdit] = useState<Clause | null>(null)

  const [selectedClauses, setSelectedClauses] = useState<number[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    loadClauses()
  }, [])

  async function loadClauses() {
    try {
      setLoading(true)
      const res = await getClauses()
      setClauses(res.data)
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar cláusulas:', err)
      setError('Não foi possível carregar as cláusulas.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = () => {
    setClauseToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (clause: Clause) => {
    setClauseToEdit(clause)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta cláusula?')) return

    try {
      await deleteClause(id)
      setClauses((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      console.error('Erro ao excluir cláusula:', err)
      alert('Falha ao excluir a cláusula.')
    }
  }

  const handleSaveClause = async (formData: ClauseFormData) => {
    try {
      let res: AxiosResponse<any, any, {}>
      if (clauseToEdit) {
        res = await updateClause(clauseToEdit.id!, formData)
        setClauses((prev) =>
          prev.map((c) => (c.id === clauseToEdit.id ? res.data : c))
        )
      } else {
        res = await createClause(formData)
        setClauses((prev) => [res.data, ...prev])
      }

      setIsModalOpen(false)
      setClauseToEdit(null)
    } catch (err) {
      console.error('Erro ao salvar cláusula:', err)
      alert('Falha ao salvar cláusula. Verifique os dados e tente novamente.')
    }
  }

  const toggleSelectClause = (id: number) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleGeneratePDF = async () => {
    const selected = clauses.filter(
      (c) => c.id != null && selectedClauses.includes(c.id)
    )
    if (selected.length === 0) {
      alert('Selecione ao menos uma cláusula para gerar o contrato.')
      return
    }

    try {
      setIsGeneratingPDF(true)
      const res = await generateContractPDF(selected)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Falha ao gerar o contrato em PDF.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-700">Carregando cláusulas...</p>
      </div>
    )

  if (error)
    return (
      <p className="p-10 text-center text-red-600 font-medium">{error}</p>
    )

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Automação de Contratos
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white transition-colors ${
                isGeneratingPDF
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5" />
              )}
              {isGeneratingPDF ? 'Gerando...' : 'Gerar PDF'}
            </button>

            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              onClick={handleOpenCreateModal}
            >
              <PlusCircle className="w-5 h-5" />
              Nova Cláusula
            </button>
          </div>
        </div>

        {/* LISTAGEM */}
        {clauses.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhuma cláusula cadastrada.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clauses.map((clause) => {
              const id = clause.id ?? -1
              const isSelected = id !== -1 && selectedClauses.includes(id)
              const isExpanded = expandedId === id

              return (
                <div
                  key={id}
                  className={`bg-white p-5 shadow-lg rounded-xl border border-gray-100 flex flex-col justify-between transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-400' : 'hover:shadow-xl'
                  }`}
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {clause.title}
                    </h2>

                    <p className="text-sm text-gray-700">
                      {isExpanded
                        ? clause.content
                        : clause.content.length > 120
                        ? `${clause.content.substring(0, 120)}...`
                        : clause.content}
                    </p>

                    {clause.content.length > 120 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : id)}
                        className="text-blue-600 hover:underline text-sm mt-1"
                      >
                        {isExpanded ? 'Ler menos' : 'Ler mais'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <button
                      onClick={() => id !== -1 && toggleSelectClause(id)}
                      className={`text-sm px-3 py-1 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected ? 'Selecionada' : 'Selecionar'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(clause)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => id !== -1 && handleDelete(id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      <ClauseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClause}
        clauseToEdit={clauseToEdit}
      />
    </>
  )
}
