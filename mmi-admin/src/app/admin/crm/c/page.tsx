'use client'

import { useState } from 'react'
import { Search, Link as LinkIcon, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CaptacaoImoveis() {
    const [termo, setTermo] = useState('')
    // NOVOS ESTADOS
    const [precoMin, setPrecoMin] = useState('')
    const [precoMax, setPrecoMax] = useState('')

    const [resultados, setResultados] = useState<string[]>([])
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function buscarImoveis(e: React.FormEvent) {
        e.preventDefault()
        if (!termo.trim()) return

        setCarregando(true)
        setErro(null)
        setResultados([])

        try {
            // ATUALIZADO: Usar URLSearchParams para montar a query
            const params = new URLSearchParams({
                termo: termo.trim(),
            })
            if (precoMin) params.append('precoMin', precoMin)
            if (precoMax) params.append('precoMax', precoMax)

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/catch/captar?${params.toString()}`
            )

            if (!res.ok) throw new Error('Falha ao buscar imóveis.')

            const data = await res.json()
            setResultados(data)
        } catch (err: any) {
            setErro('Erro ao buscar imóveis. Tente novamente mais tarde.')
            console.error(err)
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-10 min-h-screen">
            {/* Topo (sem alteração) ... */}
            <div className="flex items-center gap-4 mb-10">
                <Link
                    href="/admin/crm"
                    className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Voltar ao Painel CRM"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Search className="w-8 h-8 text-green-600" />
                    Captação de Imóveis
                </h1>
            </div>

            {/* Formulário de busca ATUALIZADO */}
            <form onSubmit={buscarImoveis} className="flex flex-wrap gap-4 mb-8 items-end">
                <div className="flex-1 min-w-[250px]">
                    <label htmlFor="termo" className="block text-sm font-medium text-gray-700 mb-1">
                        Termo de Busca
                    </label>
                    <input
                        id="termo"
                        type="text"
                        value={termo}
                        onChange={(e) => setTermo(e.target.value)}
                        placeholder="Ex: casa em Poá..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex-none">
                    <label htmlFor="precoMin" className="block text-sm font-medium text-gray-700 mb-1">
                        Preço Mín.
                    </label>
                    <input
                        id="precoMin"
                        type="number"
                        value={precoMin}
                        onChange={(e) => setPrecoMin(e.target.value)}
                        placeholder="R$ (min)"
                        className="w-full md:w-36 border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex-none">
                    <label htmlFor="precoMax" className="block text-sm font-medium text-gray-700 mb-1">
                        Preço Máx.
                    </label>
                    <input
                        id="precoMax"
                        type="number"
                        value={precoMax}
                        onChange={(e) => setPrecoMax(e.target.value)}
                        placeholder="R$ (max)"
                        className="w-full md:w-36 border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <div className="flex-none">
                    <button
                        type="submit"
                        disabled={carregando}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 w-full"
                    >
                        {carregando ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Buscando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                Buscar
                            </span>
                        )}
                    </button>
                </div>
            </form>

            {erro && (
                <div className="text-red-600 bg-red-100 border border-red-200 p-4 rounded-lg mb-4">
                    {erro}
                </div>
            )}

            {/* Resultados */}
            {carregando && !erro && (
                <p className="text-gray-500 text-center">Buscando links de imóveis...</p>
            )}

            {!carregando && resultados.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Resultados para &quot;{termo}&quot;
                    </h2>
                    <ul className="space-y-3">
                        {resultados.map((link, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <LinkIcon className="w-5 h-5 text-green-600 shrink-0" />
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline truncate"
                                    >
                                        {link}
                                    </a>
                                </div>

                                <button
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                                    onClick={() => alert(`Lead salvo: ${link}`)}
                                >
                                    Salvar Lead
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!carregando && resultados.length === 0 && !erro && (
                <p className="text-gray-500 text-center mt-10">
                    Nenhum resultado ainda. Faça uma busca acima 👆
                </p>
            )}
        </div>
    )
}
