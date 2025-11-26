'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Loader2, Send, ArrowLeft, Mail, ShieldCheck, User, FileText } from 'lucide-react'
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
  pdfData: string
  signatures: any[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SignContractPage() {
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
  // Estados do formulário (Dados Reais para Clicksign)
  const [signerName, setSignerName] = useState('')
  const [signerEmail, setSignerEmail] = useState('')
  const [signerCpf, setSignerCpf] = useState('')
  const [signerRole, setSignerRole] = useState('')

  const params = useParams()
  const { uuid } = params as { uuid: string }

  useEffect(() => {
    if (uuid) fetchContract()
  }, [uuid])

  const fetchContract = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/contracts/${uuid}`)
      setContract(res.data)
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

    // Validação simples de CPF (tamanho)
    if (signerCpf.length < 14) {
        alert('CPF incompleto.')
        return
    }

    try {
      setIsSending(true)

      const body = {
        signerName,
        email: signerEmail,
        cpf: signerCpf.replace(/\D/g, ''), // Envia apenas números
        role: signerRole
      }

      await axios.post(`${API_URL}/api/contracts/${uuid}/signatures`, body)

      alert(`Sucesso! Um e-mail foi enviado para ${signerEmail} com o link seguro para assinatura.`)
      
      // Limpar formulário
      setSignerName('')
      setSignerEmail('')
      setSignerCpf('')
      setSignerRole('')
      
      fetchContract() // Atualiza lista de "Pendentes"
    } catch (err) {
      alert('Erro ao solicitar assinatura. Verifique os dados.')
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>
  if (!contract) return <div>Contrato não encontrado.</div>

  const pdfUrl = `data:application/pdf;base64,${contract.pdfData}`

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lado Esquerdo: PDF */}
        <div className="bg-white rounded-xl shadow border h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-gray-100 rounded-t-xl">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4"/> Visualização do Contrato
                </span>
                <a href={pdfUrl} download="contrato.pdf" className="text-blue-600 text-sm hover:underline">Baixar PDF</a>
            </div>
            <iframe src={pdfUrl} className="w-full flex-1 rounded-b-xl" />
        </div>

        {/* Lado Direito: Formulário de Assinatura Digital */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-200">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Assinatura Digital</h2>
                        <p className="text-sm text-gray-500">Integração Clicksign (MP 2.200-2/2001)</p>
                    </div>
                </div>

                <form onSubmit={handleSendForSignature} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo (Conforme Documento)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={signerName}
                                onChange={e => setSignerName(e.target.value)}
                                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Ex: Maria Silva"
                            />
                            <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail para Assinatura</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={signerEmail}
                                onChange={e => setSignerEmail(e.target.value)}
                                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="email@exemplo.com"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">O link para assinar será enviado para este e-mail.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                            <input 
                                type="text" 
                                value={signerCpf}
                                maxLength={14}
                                onChange={e => setSignerCpf(maskCPF(e.target.value))}
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="000.000.000-00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Papel</label>
                            <select 
                                value={signerRole}
                                onChange={e => setSignerRole(e.target.value)}
                                className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Selecione...</option>
                                <option value="Locador">Locador</option>
                                <option value="Locatário">Locatário</option>
                                <option value="Fiador">Fiador</option>
                                <option value="Testemunha">Testemunha</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSending}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {isSending ? <Loader2 className="animate-spin" /> : <Send className="w-5 h-5" />}
                        {isSending ? 'Processando...' : 'Enviar para Assinatura'}
                    </button>
                </form>
            </div>

            {/* Lista de Envios */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">Status das Assinaturas</h3>
                {contract.signatures && contract.signatures.length > 0 ? (
                    <ul className="space-y-3">
                        {contract.signatures.map((sig, idx) => (
                            <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                <div>
                                    <p className="font-semibold text-sm">{sig.signerName}</p>
                                    <p className="text-xs text-gray-500">{sig.email}</p>
                                </div>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    Enviado
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">Nenhuma solicitação enviada ainda.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}