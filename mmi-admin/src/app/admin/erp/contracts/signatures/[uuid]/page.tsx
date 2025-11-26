'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import SignatureCanvas from 'react-signature-canvas'
import { Loader2, Save, Trash2, ArrowLeft, PenTool, ArrowDownCircle } from 'lucide-react'
import Link from 'next/link'

interface Signature {
  id: number
  signatureImage: string
  signerName: string
}

interface Contract {
  uuid: string
  pdfData: string
  signatures: Signature[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SignContractPage() {
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSigning, setIsSigning] = useState(false)
  const [signerName, setSignerName] = useState('')
  
  // Ref para rolar até a assinatura em mobile
  const signatureSectionRef = useRef<HTMLDivElement>(null)

  const params = useParams()
  const { uuid } = params as { uuid: string }
  const sigCanvas = useRef<SignatureCanvas>(null)

  const fetchContract = async () => {
    if (!uuid) return
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/api/contracts/${uuid}`)
      setContract(res.data)
      setError(null)
    } catch (err) {
      setError('Contrato não encontrado ou expirado.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (uuid) {
      fetchContract()
    }
  }, [uuid])

  // Função para limpar e forçar resize se necessário
  const handleClearSignature = () => {
    sigCanvas.current?.clear()
    setSignerName('')
  }

  const scrollToSignature = () => {
    signatureSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSaveSignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Por favor, desenhe sua assinatura primeiro.')
      return
    }
    
    if (!signerName.trim()) {
      alert('Por favor, digite seu nome completo.')
      return
    }

    // Pega a imagem (com fundo transparente para não salvar branco)
    const signatureImage = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png')

    if (!signatureImage) {
      alert('Não foi possível capturar a assinatura.')
      return
    }

    try {
      setIsSigning(true)

      const body = {
        signatureImage: signatureImage,
        signerName: signerName.trim()
      }

      await axios.post(`${API_URL}/api/contracts/${uuid}/signatures`, body, {
        headers: { 'Content-Type': 'application/json' }
      });

      await fetchContract()
      handleClearSignature()
      alert('Assinatura salva com sucesso!')
    } catch (err) {
      alert('Erro ao salvar assinatura.')
      console.error(err)
    } finally {
      setIsSigning(false)
    }
  }

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600 font-medium">Carregando documento...</p>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4">
        <p className="text-center text-red-500 font-semibold mb-4">{error}</p>
        <Link href="/admin/erp/contracts" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar para Contratos
        </Link>
      </div>
    )

  if (!contract) return null

  const pdfUrl = `data:application/pdf;base64,${contract.pdfData}`

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header Mobile Compacto */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 shadow-sm lg:static lg:shadow-none lg:border-none lg:bg-transparent lg:pt-8 lg:px-8">
        <div className="container mx-auto">
          <Link
            href="/admin/erp/contracts"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar para lista</span>
            <span className="sm:hidden">Voltar</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* COLUNA 1: Visualizador de PDF */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               {/* Altura ajustada: menor no mobile (50vh) para facilitar scroll até assinatura */}
              <iframe
                src={pdfUrl}
                className="w-full h-[50vh] lg:h-[85vh] block"
                title={`Contrato ${contract.uuid}`}
              >
                <div className="p-8 text-center">
                  <p>Seu dispositivo não suporta visualização de PDF.</p>
                  <a href={pdfUrl} download="contrato.pdf" className="text-blue-600 underline">Baixar PDF</a>
                </div>
              </iframe>
            </div>
          </div>

          {/* COLUNA 2: Área de Ação (Assinatura e Lista) */}
          <div className="lg:col-span-1 order-2 flex flex-col gap-6" ref={signatureSectionRef}>
            
            {/* Card de Assinatura */}
            <div className="bg-white p-5 rounded-xl shadow-md border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <PenTool className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Sua Assinatura</h2>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">
                Use o dedo ou mouse para assinar abaixo.
              </p>

              {/* Área do Canvas com touch-none para evitar scroll da página ao desenhar */}
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 touch-none overflow-hidden">
                {!isSigning && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                        <span className="text-4xl font-serif italic text-gray-500">Assine Aqui</span>
                    </div>
                )}
                
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor='black'
                  velocityFilterWeight={0.7}
                  minWidth={1.5}
                  maxWidth={3.5}
                  canvasProps={{ 
                      className: 'w-full h-48 block cursor-crosshair' 
                      // 'block' remove espaços fantasmas inline
                  }}
                />
              </div>
              
              <div className="flex justify-end mt-1">
                  <button onClick={handleClearSignature} className="text-xs text-red-500 hover:text-red-700 font-medium py-1 px-2">
                      Limpar desenho
                  </button>
              </div>

              {/* Input Nome */}
              <div className="mt-2">
                <label htmlFor="signerName" className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome Completo (Legível)
                </label>
                <input
                  type="text"
                  id="signerName"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Ex: João da Silva"
                />
              </div>

              {/* Botões de Ação - Maiores para Mobile */}
              <div className="mt-6">
                <button
                  onClick={handleSaveSignature}
                  disabled={isSigning}
                  className="w-full bg-blue-600 text-white px-4 py-3.5 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-medium text-lg"
                >
                  {isSigning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  {isSigning ? 'Salvando...' : 'Confirmar Assinatura'}
                </button>
              </div>
            </div>

            {/* Lista de Assinaturas Existentes */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-md font-bold text-gray-700 mb-4 border-b pb-2">Assinaturas Realizadas</h3>
              {contract?.signatures?.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {contract.signatures.map(sig => (
                    <div key={sig.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="bg-white p-1 rounded border h-12 w-20 flex items-center justify-center">
                        <img src={sig.signatureImage} alt="Assinatura" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {sig.signerName}
                        </p>
                        <p className="text-xs text-gray-500">Assinado digitalmente</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-sm text-gray-400">Nenhuma assinatura ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
            onClick={scrollToSignature}
            className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform active:scale-90 flex items-center justify-center"
            aria-label="Ir para assinatura"
        >
            <ArrowDownCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}