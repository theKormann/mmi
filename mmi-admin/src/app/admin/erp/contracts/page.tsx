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
  X,
  Search,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react'
import ClauseModal from '../../../../components/ClauseModal'
import { AxiosResponse } from 'axios'
import axios from 'axios'

// --- COMPONENTS ---

// Modal simples para o Nome do Contrato (Substitui o window.prompt)
const ContractNameModal = ({ isOpen, onClose, onConfirm, loading }: any) => {
  const [title, setTitle] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nomear Contrato</h3>
        <p className="text-sm text-gray-500 mb-4">
          Dê um nome identificável para este contrato (ex: Cliente X - Prestação de Serviços).
        </p>
        <input
          autoFocus
          type="text"
          placeholder="Digite o título aqui..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(title)}
            disabled={!title.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar e Assinar
          </button>
        </div>
      </div>
    </div>
  )
}

// --- MAIN PAGE ---

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

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false) // Novo modal de nome
  
  const [clauseToEdit, setClauseToEdit] = useState<Clause | null>(null)
  const [selectedClauses, setSelectedClauses] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      try {
        const [clausesRes, contractsRes] = await Promise.all([
          getClauses(),
          axios.get(`${API_URL}/api/contracts`)
        ])
        setClauses(clausesRes.data)
        setContracts(contractsRes.data)
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

  // Handlers de Cláusula
  const handleOpenCreateModal = () => {
    setClauseToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (e: React.MouseEvent, clause: Clause) => {
    e.stopPropagation()
    setClauseToEdit(clause)
    setIsModalOpen(true)
  }

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!window.confirm('Tem certeza que deseja excluir esta cláusula?')) return
    try {
      await deleteClause(id)
      setClauses((prev) => prev.filter((c) => c.id !== id))
      setSelectedClauses((prev) => prev.filter((cid) => cid !== id))
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

  // Handlers de Contrato
  const handleInitiateGeneration = () => {
    if (selectedClauses.length === 0) return
    setIsNameModalOpen(true) // Abre o modal em vez do prompt
  }

  const handleConfirmGeneration = async (contractTitle: string) => {
    const selected = clauses.filter(
      (c) => c.id != null && selectedClauses.includes(c.id),
    )

    try {
      setIsGenerating(true)
      const payload = {
        title: contractTitle,
        clauses: selected
      }
      const res = await axios.post(`${API_URL}/api/contracts`, payload)
      const contractUuid = res.data
      router.push(`/admin/erp/contracts/signatures/${contractUuid}`)
    } catch (err) {
      console.error('Erro ao criar contrato:', err)
      alert('Falha ao iniciar o processo de assinatura.')
      setIsGenerating(false)
      setIsNameModalOpen(false)
    }
  }

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Carregando gestão de contratos...</p>
      </div>
    )

  if (error)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32">
      {/* --- HEADER --- */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/admin/erp"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Gestor de Contratos
              </h1>
              <p className="text-xs text-gray-500 hidden md:block">Gerencie cláusulas e emita contratos digitais.</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              className="flex-1 md:flex-none items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all font-medium flex text-sm"
              onClick={handleOpenCreateModal}
            >
              <PlusCircle className="w-4 h-4" />
              Nova Cláusula
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        
        {/* --- SEÇÃO: CLÁUSULAS --- */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-gray-500" />
                Biblioteca de Cláusulas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecione as cláusulas abaixo para montar um novo documento.
              </p>
            </div>
            <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {selectedClauses.length} selecionadas
            </div>
          </div>

          {clauses.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-medium mb-1">Nenhuma cláusula encontrada</h3>
              <p className="text-gray-500 text-sm mb-4">Comece criando os blocos de texto para seus contratos.</p>
              <button 
                onClick={handleOpenCreateModal}
                className="text-blue-600 font-medium hover:underline text-sm"
              >
                Criar primeira cláusula
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clauses.map((clause) => {
                const id = clause.id ?? -1
                const isSelected = id !== -1 && selectedClauses.includes(id)
                const isExpanded = expandedId === id

                return (
                  <div
                    key={id}
                    onClick={() => id !== -1 && toggleSelectClause(id)}
                    className={`
                      group relative bg-white p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col
                      ${isSelected 
                        ? 'border-blue-500 ring-1 ring-blue-500 shadow-md bg-blue-50/10' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }
                    `}
                  >
                    {/* Checkbox Visual */}
                    <div className={`absolute top-4 right-4 transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-300 group-hover:text-blue-400'}`}>
                      {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                    </div>

                    <h3 className="font-semibold text-gray-900 pr-8 mb-2 line-clamp-1" title={clause.title}>
                      {clause.title}
                    </h3>
                    
                    <div className="flex-grow">
                      <p className={`text-sm text-gray-600 leading-relaxed ${!isExpanded && 'line-clamp-4'}`}>
                        {clause.content}
                      </p>
                      {clause.content.length > 150 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedId(isExpanded ? null : id)
                          }}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-2 hover:underline focus:outline-none"
                        >
                          {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
                        </button>
                      )}
                    </div>

                    {/* Ações (Só aparecem no hover ou se selecionado para não poluir) */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEditModal(e, clause)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* --- SEÇÃO: HISTÓRICO DE CONTRATOS --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <FileSignature className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Histórico de Contratos</h2>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-16 bg-gray-100/50 rounded-xl border border-gray-200">
              <p className="text-gray-500">Nenhum contrato gerado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {contracts.map((contract) => {
                const signatureCount = contract.signatures.length
                const isSigned = signatureCount > 0

                return (
                  <div
                    key={contract.uuid}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="font-bold text-gray-900 truncate" title={contract.title}>
                          {contract.title || "Contrato Sem Título"}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                          ID: {contract.uuid}
                        </p>
                      </div>
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3 h-3" /> Assinado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-grow">
                      {isSigned ? (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Signatários ({signatureCount})
                          </p>
                          <ul className="space-y-2">
                            {contract.signatures.slice(0, 3).map((sig) => (
                              <li key={sig.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                  {sig.signerName.charAt(0)}
                                </div>
                                <span className="truncate">{sig.signerName}</span>
                              </li>
                            ))}
                            {contract.signatures.length > 3 && (
                              <li className="text-xs text-gray-400 pl-8">+ {contract.signatures.length - 3} outros</li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-4 text-gray-400 text-sm">
                          <FileText className="w-8 h-8 mb-2 opacity-20" />
                          Aguardando assinaturas...
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <Link
                        href={`/admin/erp/contracts/signatures/${contract.uuid}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors text-sm shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* --- FLOATING ACTION BAR (Aparece quando seleciona) --- */}
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${selectedClauses.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 border border-gray-700">
          <span className="font-medium text-sm flex items-center gap-2">
            <div className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedClauses.length}
            </div>
            cláusulas selecionadas
          </span>
          
          <div className="h-4 w-px bg-gray-700"></div>

          <button 
            onClick={() => setSelectedClauses([])}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Limpar
          </button>

          <button
            onClick={handleInitiateGeneration}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Gerar Contrato
          </button>
        </div>
      </div>

      {/* Modais */}
      <ClauseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClause}
        clauseToEdit={clauseToEdit}
      />

      <ContractNameModal 
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onConfirm={handleConfirmGeneration}
        loading={isGenerating}
      />
    </div>
  )
}