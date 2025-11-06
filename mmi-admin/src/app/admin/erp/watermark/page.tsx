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

// 1. Corrigido: Esta deve ser a URL BASE do seu servidor.
// (Sem /api no final, pois o backend já define /api/v1/...)
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

export default function WatermarkGeneratorPage() {
    const [originalFile, setOriginalFile] = useState<File | null>(null)
    const [originalPreview, setOriginalPreview] = useState<string | null>(null)
    const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setOriginalFile(file)
            setError(null)
            setWatermarkedImage(null)
            const reader = new FileReader()
            reader.onloadend = () => {
                setOriginalPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
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

        // 2. CORREÇÃO APLICADA AQUI:
        // Concatenamos a URL base com o caminho completo do endpoint do Spring
        const fullEndpoint = `${API_BASE_URL}/api/v1/media/watermark`

        try {
            const response = await fetch(fullEndpoint, { // <-- Usando a URL completa
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
            console.error('Falha ao gerar marca d\'água:', err)
            setError(
                err.message ||
                'Não foi possível gerar a marca d\'água. Verifique o console ou o backend.',
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
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors mb-6"
                    >
                        {originalPreview ? (
                            <img
                                src={originalPreview}
                                alt="Preview"
                                className="object-contain h-full w-full p-2"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                                <UploadCloud className="w-10 h-10 mb-3" />
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
                            className="inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5" />
                        <p>
                            <strong>Erro:</strong> {error}
                        </p>
                    </div>
                )}

                {watermarkedImage && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                            Resultado
                        </h2>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <img
                                src={watermarkedImage}
                                alt="Imagem com marca d'água"
                                className="w-full h-auto object-contain rounded-md"
                            />
                        </div>
                        <div className="text-center mt-6">
                            <a
                                href={watermarkedImage}
                                download={`marca-dagua-${originalFile?.name || 'imagem.png'}`}
                                className="inline-flex items-center justify-center px-6 py-2 font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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