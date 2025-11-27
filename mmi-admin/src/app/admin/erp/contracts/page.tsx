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
  Plus,
  Trash2,
  FileText,
  Edit2,
  ArrowLeft,
  FileCheck,
  Loader2,
  ScrollText,
  CheckCircle2,
  Clock,
  Eye,
  X,
  MoreHorizontal,
  Check,
  File
} from 'lucide-react'
import ClauseModal from '../../../../components/ClauseModal'
import { AxiosResponse } from 'axios'
import axios from 'axios'

// --- COMPONENTS ---

const ContractNameModal = ({ isOpen, onClose, onConfirm, loading }: any) => {
  const [title, setTitle] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Novo Contrato</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Defina um nome para identificar este documento facilmente.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Título do Documento</label>
            <input
              autoFocus
              type="text"
              placeholder="Ex: Contrato de Locação - Unidade 101"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(title)}
            disabled={!title.trim() || loading}
            className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-200 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
            Gerar Documento
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  
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

  // ... (Handlers mantidos iguais: handleDelete, handleSaveClause, etc) ...
  // Apenas copiando a lógica para não quebrar, foco no visual abaixo
  const handleOpenCreateModal = () => { setClauseToEdit(null); setIsModalOpen(true) }
  const handleOpenEditModal = (e: any, clause: Clause) => { e.stopPropagation(); setClauseToEdit(clause); setIsModalOpen(true) }
  const handleDelete = async (e: any, id: number) => {
    e.stopPropagation(); if (!window.confirm('Excluir?')) return
    try { await deleteClause(id); setClauses(prev => prev.filter(c => c.id !== id)); setSelectedClauses(prev => prev.filter(cid => cid !== id)) } catch { alert('Erro ao excluir') }
  }
  const handleSaveClause = async (formData: ClauseFormData) => {
    try {
      let res; if (clauseToEdit) { res = await updateClause(clauseToEdit.id!, formData); setClauses(prev => prev.map(c => c.id === clauseToEdit.id ? res.data : c)) } else { res = await createClause(formData); setClauses(prev => [res.data, ...prev]) }
      setIsModalOpen(false); setClauseToEdit(null)
    } catch { alert('Erro ao salvar') }
  }
  const toggleSelectClause = (id: number) => { setSelectedClauses(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]) }
  const handleInitiateGeneration = () => { if (selectedClauses.length === 0) return; setIsNameModalOpen(true) }
  const handleConfirmGeneration = async (contractTitle: string) => {
    const selected = clauses.filter(c => c.id != null && selectedClauses.includes(c.id))
    try {
      setIsGenerating(true)
      const res = await axios.post(`${API_URL}/api/contracts`, { title: contractTitle, clauses: selected })
      router.push(`/admin/erp/contracts/signatures/${res.data}`)
    } catch { alert('Erro ao gerar'); setIsGenerating(false); setIsNameModalOpen(false) }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 font-sans">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/erp" className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-blue-600" />
              Gestão de Contratos
            </h1>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Cláusula</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* --- SEÇÃO: BIBLIOTECA DE CLÁUSULAS --- */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Biblioteca de Cláusulas</h2>
              <p className="text-sm text-gray-500 mt-1">Selecione os blocos de texto para compor seu documento.</p>
            </div>
            {selectedClauses.length > 0 && (
               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                 {selectedClauses.length} selecionada{selectedClauses.length !== 1 && 's'}
               </span>
            )}
          </div>

          {clauses.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-medium">Sua biblioteca está vazia</h3>
              <p className="text-gray-500 text-sm mt-1">Adicione cláusulas padrão para agilizar seus contratos.</p>
            </div>
          ) : (
            // AQUI ESTÁ A MUDANÇA: Grid responsivo forçado
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {clauses.map((clause) => {
                const id = clause.id ?? -1
                const isSelected = id !== -1 && selectedClauses.includes(id)
                const isExpanded = expandedId === id

                return (
                  <div
                    key={id}
                    onClick={() => id !== -1 && toggleSelectClause(id)}
                    className={`
                      relative p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col h-full
                      ${isSelected 
                        ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 pr-6" title={clause.title}>
                        {clause.title}
                      </h3>
                      <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
                      `}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    
                    <div className="flex-grow">
                      <p className={`text-xs text-gray-600 leading-relaxed ${!isExpanded && 'line-clamp-4'}`}>
                        {clause.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                       <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : id) }}
                          className="text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {isExpanded ? 'Recolher' : 'Ler tudo'}
                        </button>

                        <div className="flex gap-1">
                          <button onClick={(e) => handleOpenEditModal(e, clause)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => handleDelete(e, id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* --- SEÇÃO: HISTÓRICO DE CONTRATOS --- */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
            <FileCheck className="w-5 h-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900">Contratos Gerados</h2>
          </div>

          {contracts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 text-sm">Nenhum contrato gerado ainda.</p>
            </div>
          ) : (
            // GRID DE CONTRATOS REFEITA
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contracts.map((contract) => {
                const signatureCount = contract.signatures.length
                const isSigned = signatureCount > 0

                return (
                  <div
                    key={contract.uuid}
                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                  >
                    {/* Header do Card (Status e Icone) */}
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <File className="w-5 h-5 text-gray-400" />
                        </div>
                        {isSigned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                <CheckCircle2 className="w-3 h-3" /> Assinado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                <Clock className="w-3 h-3" /> Pendente
                            </span>
                        )}
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-1 truncate" title={contract.title}>
                            {contract.title || "Sem Título"}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono mb-4">
                            ID: {contract.uuid.split('-')[0]}
                        </p>

                        <div className="mt-auto">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                {signatureCount} {signatureCount === 1 ? 'Signatário' : 'Signatários'}
                            </div>
                            {signatureCount > 0 ? (
                                <div className="flex -space-x-2 overflow-hidden">
                                    {contract.signatures.slice(0, 4).map((sig, i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600" title={sig.signerName}>
                                            {sig.signerName.charAt(0)}
                                        </div>
                                    ))}
                                    {contract.signatures.length > 4 && (
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                                            +{contract.signatures.length - 4}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">Aguardando envio...</p>
                            )}
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs text-gray-400">Criado recentemente</span>
                        <Link
                            href={`/admin/erp/contracts/signatures/${contract.uuid}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                            Detalhes <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* --- BARRA FLUTUANTE (Floating Action Bar) --- */}
      <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${selectedClauses.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl flex items-center gap-6 border border-gray-800">
          <div className="flex flex-col">
             <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Seleção</span>
             <span className="text-sm font-medium">{selectedClauses.length} Cláusulas</span>
          </div>
          
          <div className="h-8 w-px bg-gray-700"></div>

          <div className="flex items-center gap-2">
            <button 
                onClick={() => setSelectedClauses([])}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
                Limpar
            </button>

            <button
                onClick={handleInitiateGeneration}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                Gerar Contrato
            </button>
          </div>
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