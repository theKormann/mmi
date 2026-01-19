'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Loader2, Send, ArrowLeft, Mail, ShieldCheck, User, FileText, Download } from 'lucide-react'
import Link from 'next/link'

// Função utilitária para máscara de CPF
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

interface Contract {
  uuid: string
  title?: string
  pdfData: string // Base64 vindo do Java
  signatures: any[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SignContractPage() {
  const [contract, setContract] = useState<Contract | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null) // URL do Blob para o navegador
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  // Estados do formulário
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerCpf, setSignerCpf] = useState('')
  const [signerRole, setSignerRole] = useState('')

  const params = useParams()
  const { uuid } = params as { uuid: string }

  useEffect(() => {
    if (uuid) fetchContract()
    
    // Limpeza de memória ao sair da página
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [uuid])

  const fetchContract = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/contracts/${uuid}`)
      const contractData = res.data
      setContract(contractData)

      // --- CORREÇÃO: Converter Base64 para Blob URL ---
      if (contractData.pdfData) {
        const byteCharacters = atob(contractData.pdfData)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      }
      // ------------------------------------------------

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendForSignature = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!signerName || !signerEmail || !signerCpf || !signerRole) {
      alert('Todos os campos são obrigatórios para a validação jurídica.')
      return
    }

    if (signerCpf.length < 14) {
        alert('CPF incompleto.')
        return
    }

    try {
      setIsSending(true)

      const body = {
        signerName,
        email: signerEmail,
        cpf: signerCpf.replace(/\D/g, ''),
        role: signerRole
      }

      await axios.post(`${API_URL}/api/contracts/${uuid}/signatures`, body)

      alert(`Sucesso! Um e-mail foi enviado para ${signerEmail} com o link seguro para assinatura.`)
      
      setSignerName('')
      setSignerEmail('')
      setSignerCpf('')
      setSignerRole('')
      
      fetchContract()
    } catch (err) {
      alert('Erro ao solicitar assinatura. Verifique os dados.')
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
  if (!contract) return <div className="p-8 text-center">Contrato não encontrado.</div>

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8 font-sans">
      
      {/* Header de Navegação */}
      <div className="max-w-6xl mx-auto mb-6">
        <Link href="/admin/erp/contracts" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para lista
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lado Esquerdo: Visualizador de PDF Robusto */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600"/> 
                    {contract.title || "Visualização do Documento"}
                </span>
                {pdfUrl && (
                  <a 
                    href={pdfUrl} 
                    download={`${contract.title || 'contrato'}.pdf`} 
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Baixar
                  </a>
                )}
            </div>
            
            <div className="flex-1 bg-gray-200 relative">
                {pdfUrl ? (
                    <iframe 
                        src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                        className="w-full h-full border-none" 
                        title="PDF Viewer"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                )}
            </div>
        </div>

        {/* Lado Direito: Formulário de Assinatura Digital */}
        <div className="space-y-6 h-[85vh] overflow-y-auto pr-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Coletar Assinatura</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Integração Oficial Clicksign (MP 2.200-2)</p>
                    </div>
                </div>

                <form onSubmit={handleSendForSignature} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nome do Signatário</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={signerName}
                                onChange={e => setSignerName(e.target.value)}
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all group-hover:bg-white"
                                placeholder="Nome completo conforme documento"
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">E-mail para Link</label>
                        <div className="relative group">
                            <input 
                                type="email" 
                                value={signerEmail}
                                onChange={e => setSignerEmail(e.target.value)}
                                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all group-hover:bg-white"
                                placeholder="email@exemplo.com"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">CPF</label>
                            <input 
                                type="text" 
                                value={signerCpf}
                                maxLength={14}
                                onChange={e => setSignerCpf(maskCPF(e.target.value))}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="000.000.000-00"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Papel</label>
                            <select 
                                value={signerRole}
                                onChange={e => setSignerRole(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="Locador">Locador</option>
                                <option value="Locatário">Locatário</option>
                                <option value="Fiador">Fiador</option>
                                <option value="Testemunha">Testemunha</option>
                                <option value="Comprador">Comprador</option>
                                <option value="Vendedor">Vendedor</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {isSending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                        {isSending ? 'Processando Envio...' : 'Enviar para Assinatura'}
                    </button>
                </form>
            </div>

            {/* Lista de Envios */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Histórico de Envios
                </h3>
                {contract.signatures && contract.signatures.length > 0 ? (
                    <ul className="space-y-3">
                        {contract.signatures.map((sig, idx) => (
                            <li key={idx} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {sig.signerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{sig.signerName}</p>
                                        <p className="text-xs text-gray-500">{sig.email}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 px-2 py-1 rounded-md">
                                    Aguardando
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
                        <p className="text-sm text-gray-400">Nenhum signatário adicionado ainda.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}