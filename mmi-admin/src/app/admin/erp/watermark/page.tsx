'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  Download,
  AlertTriangle,
} from 'lucide-react'

// --- ATUALIZADO: Usando a variável correta do Vercel ---
// Se NEXT_PUBLIC_API_URL não estiver definido, usa o localhost como fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function WatermarkGeneratorPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Função centralizada para processar o arquivo
  const processFile = (file: File) => {
    // Validação básica de tipo
    if (!file.type.startsWith('image/')) {
      setError('Arquivo inválido. Por favor, envie uma imagem (PNG, JPG).')
      return
    }

    setOriginalFile(file)
    setError(null)
    setWatermarkedImage(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setOriginalPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // --- Handlers de Drag and Drop ---

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!originalFile) {
      setError('Por favor, selecione uma imagem primeiro.')
      return
    }

    setIsLoading(true)
    setError(null)
    setWatermarkedImage(null)

    const formData = new FormData()
    formData.append('file', originalFile)

    const baseUrl = API_URL.replace(/\/$/, '') 
    const fullEndpoint = `${baseUrl}/api/v1/media/watermark`

    try {
      const response = await fetch(fullEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(
          `Erro na API: ${response.status} ${response.statusText}`,
        )
      }

      const imageBlob = await response.blob()
      const imageUrl = URL.createObjectURL(imageBlob)
      setWatermarkedImage(imageUrl)
    } catch (err: any) {
      console.error("Falha ao gerar marca d'água:", err)
      setError(
        err.message ||
          'Não foi possível gerar a marca dágua. Verifique o console ou o backend.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin/erp"
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar ao Painel ERP"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ImageIcon className="w-8 h-8 text-orange-600" />
          Gerador de Marca d'Água
        </h1>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors mb-6 ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50 scale-[1.02]'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {originalPreview ? (
              <img
                src={originalPreview}
                alt="Preview"
                className="object-contain h-full w-full p-2 rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                <UploadCloud className={`w-10 h-10 mb-3 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                <p className="mb-2 text-sm">
                  <span className="font-semibold">Clique para enviar</span> ou
                  arraste e solte
                </p>
                <p className="text-xs">PNG, JPG ou JPEG</p>
              </div>
            )}
            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </label>

          <div className="text-center mb-6">
            <button
              type="submit"
              disabled={!originalFile || isLoading}
              className="inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Aplicar Marca d\'Água'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p>
              <strong>Erro:</strong> {error}
            </p>
          </div>
        )}

        {watermarkedImage && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              Resultado
              <span className="text-xs font-normal bg-green-100 text-green-800 px-2 py-1 rounded-full">Sucesso</span>
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50 shadow-inner">
              <img
                src={watermarkedImage}
                alt="Imagem com marca d'água"
                className="w-full h-auto object-contain rounded-md max-h-[600px] mx-auto"
              />
            </div>
            <div className="text-center mt-6">
              <a
                href={watermarkedImage}
                download={`marca-dagua-${originalFile?.name || 'imagem.png'}`}
                className="inline-flex items-center justify-center px-6 py-2 font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar Imagem
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}