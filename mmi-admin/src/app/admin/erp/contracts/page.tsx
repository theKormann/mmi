'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  getClauses,
  deleteClause,
  createClause,
  updateClause,
  Clause,
} from '../../../../../services/api'
import {
  PlusCircle,
  Trash2,
  FileText,
  Edit,
  ArrowLeft,
  FileDown,
  Loader2,
  FileSignature,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react'
import ClauseModal from '../../../../components/ClauseModal'
import { AxiosResponse } from 'axios'
import axios from 'axios'

type ClauseFormData = Omit<Clause, 'id' | 'createdAt'>

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface Signature {
  id: number
  signatureImage: string
  signerName: string
}

interface Contract {
  uuid: string
  title: string
  signatures: Signature[]
}

export default function ContractsPage() {
  const [clauses, setClauses] = useState<Clause[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clauseToEdit, setClauseToEdit] = useState<Clause | null>(null)

  const [selectedClauses, setSelectedClauses] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  // ✅ 3. USEEFFECT ATUALIZADO PARA CARREGAR CLÁUSULAS E CONTRATOS
  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      try {
        // Carrega cláusulas e contratos em paralelo
        const clausePromise = getClauses()
        const contractPromise = axios.get(`${API_URL}/api/contracts`)

        const [clausesRes, contractsRes] = await Promise.all([
          clausePromise,
          contractPromise,
        ])

        setClauses(clausesRes.data)
        setContracts(contractsRes.data) // Seta o novo estado

        setError(null)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Não foi possível carregar os dados da página.')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])
  // A função loadClauses() original foi removida e incorporada acima

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
      alert('Falha ao excluir a cláusula.')
    }
  }

  const handleSaveClause = async (formData: ClauseFormData) => {
    try {
      let res: AxiosResponse<any, any, {}>
      if (clauseToEdit) {
        res = await updateClause(clauseToEdit.id!, formData)
        setClauses((prev) =>
          prev.map((c) => (c.id === clauseToEdit.id ? res.data : c)),
        )
      } else {
        res = await createClause(formData)
        setClauses((prev) => [res.data, ...prev])
      }
      setIsModalOpen(false)
      setClauseToEdit(null)
    } catch (err) {
      alert('Falha ao salvar cláusula.')
    }
  }

  const toggleSelectClause = (id: number) => {
    setSelectedClauses((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    )
  }

  const handleGenerateContract = async () => {
    const selected = clauses.filter(
      (c) => c.id != null && selectedClauses.includes(c.id),
    )
    if (selected.length === 0) {
      alert('Selecione ao menos uma cláusula para gerar o contrato.')
      return
    }

    // --- NOVO: PEDIR O NOME ---
    const contractTitle = window.prompt("Digite um nome para este contrato (Ex: Contrato João Silva):");
    if (!contractTitle) return; // Cancela se não digitar nada
    // --------------------------

    try {
      setIsGenerating(true)

      // --- NOVO: ENVIAR O OBJETO COM TÍTULO E CLÁUSULAS ---
      const payload = {
        title: contractTitle,
        clauses: selected
      }

      const res = await axios.post(`${API_URL}/api/contracts`, payload)

      const contractUuid = res.data
      router.push(`/admin/erp/contracts/signatures/${contractUuid}`)
    } catch (err) {
      console.error('Erro ao criar contrato para assinatura:', err)
      alert('Falha ao iniciar o processo de assinatura.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )

  if (error)
    return (
      <p className="p-10 text-center text-red-600 font-medium">{error}</p>
    )

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/erp"
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Gestor de Contratos
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white transition-colors ${isGenerating || selectedClauses.length === 0
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
              onClick={handleGenerateContract}
              disabled={isGenerating || selectedClauses.length === 0}
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileDown className="w-5 h-5" />
              )}
              {isGenerating ? 'Iniciando...' : 'Gerar e Assinar'}
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

        {/* Seção de Cláusulas */}
        <p className="mb-4 text-gray-600">
          Selecione as cláusulas abaixo para gerar um novo contrato.
        </p>
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
                  className={`bg-white p-5 shadow-lg rounded-xl border flex flex-col justify-between transition-all duration-200 ${isSelected
                      ? 'ring-2 ring-blue-400 border-blue-400'
                      : 'border-gray-100 hover:shadow-xl'
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
                      className={`text-sm px-3 py-1 rounded-md transition-colors ${isSelected
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

        {/* ✅ 4. SEÇÃO DE CONTRATOS GERADOS */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
            <FileSignature className="w-7 h-7 text-gray-700" />
            Contratos Gerados
          </h2>
          {contracts.length === 0 ? (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                Nenhum contrato foi gerado ainda.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => {
                const signatureCount = contract.signatures.length
                const isSigned = signatureCount > 0

                return (
                  <div
                    key={contract.uuid}
                    className="bg-white p-5 shadow-lg rounded-xl border border-gray-100 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-3 truncate flex flex-col">
                     
                        <span title={contract.title}>{contract.title}</span>
                        <span className="font-mono text-xs text-gray-400 font-normal">
                          ID: {contract.uuid.split('-')[0]}...
                        </span>
                      </h3>

                      {isSigned ? (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Assinado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-sm font-medium text-orange-600">
                          <Clock className="w-4 h-4" />
                          Pendente de assinatura
                        </span>
                      )}

                      {/* Lista de signatários */}
                      {isSigned && (
                        <div className="mt-4 text-sm text-gray-600">
                          <strong className="text-gray-800">
                            {signatureCount}{' '}
                            {signatureCount > 1
                              ? 'Signatários'
                              : 'Signatário'}
                            :
                          </strong>
                          <ul className="list-none mt-1 space-y-1">
                            {contract.signatures.map((sig) => (
                              <li key={sig.id} className="truncate">
                                {sig.signerName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t">
                      <Link
                        href={`/admin/erp/contracts/signatures/${contract.uuid}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg shadow text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Contrato e Assinaturas
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ClauseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClause}
        clauseToEdit={clauseToEdit}
      />
    </>
  )
}