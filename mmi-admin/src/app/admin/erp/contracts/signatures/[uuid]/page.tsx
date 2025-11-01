'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import SignatureCanvas from 'react-signature-canvas'
import { Loader2, Save, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Signature {
  id: number
  signatureImage: string 
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
  
  const params = useParams()
  const { uuid } = params as { uuid: string } // Cast para string
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
    if(uuid) {
      fetchContract()
    }
  }, [uuid])

  const handleClearSignature = () => {
    sigCanvas.current?.clear()
  }

  const handleSaveSignature = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert('Por favor, desenhe sua assinatura primeiro.')
      return
    }
    
    const signatureImage = sigCanvas.current?.toDataURL('image/png')
    
    if (!signatureImage) {
        alert('Não foi possível capturar a assinatura.')
        return
    }

    try {
        setIsSigning(true)
        await axios.post(`${API_URL}/api/contracts/${uuid}/signatures`, signatureImage, {
            headers: { 'Content-Type': 'text/plain' }
        });
        
        await fetchContract()
        sigCanvas.current?.clear()
    } catch (err) {
        alert('Erro ao salvar assinatura.')
        console.error(err)
    } finally {
        setIsSigning(false)
    }
  }
  
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600">Carregando contrato...</p>
      </div>
    )
    
  if (error)
    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <p className="text-center mt-10 text-red-500 font-semibold">{error}</p>
            <Link href="/admin/erp/contracts" className="mt-4 text-blue-600 hover:underline">
                Voltar para Contratos
            </Link>
        </div>
    )

  if (!contract) return null

  const pdfUrl = `data:application/pdf;base64,${contract.pdfData}`

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Link 
            href="/admin/erp/contracts" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para lista de cláusulas
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-100 rounded-lg shadow-inner">
          <iframe 
            src={pdfUrl} 
            width="100%" 
            height="100%" 
            className="min-h-[80vh] rounded-lg border"
            title={`Contrato ${contract.uuid}`}
          >
            Este navegador não suporta a visualização de PDFs.
          </iframe>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Assinar Documento</h2>
            <p className="text-gray-600 mb-4">Desenhe sua assinatura no campo abaixo:</p>
            
            <div className="border border-dashed rounded-md bg-gray-50">
              <SignatureCanvas 
                ref={sigCanvas}
                penColor='black'
                canvasProps={{ className: 'w-full h-48' }} 
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={handleSaveSignature}
                disabled={isSigning}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2 transition-colors"
              >
                {isSigning ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                {isSigning ? 'Salvando...' : 'Adicionar Assinatura'}
              </button>
              <button 
                onClick={handleClearSignature}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-5 h-5"/> Limpar
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Assinaturas neste documento</h3>
              {contract.signatures.length > 0 ? (
                  <div className="space-y-4">
                      {contract.signatures.map(sig => (
                          <div key={sig.id} className="border-b pb-2 flex justify-center bg-gray-50 rounded p-2">
                             <img src={sig.signatureImage} alt="Assinatura" className="h-20 object-contain"/>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma assinatura foi adicionada ainda.
                  </p>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}