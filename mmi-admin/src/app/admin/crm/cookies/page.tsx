'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Fingerprint, Loader2 } from 'lucide-react'

// Interface para os dados do evento
interface TrackingEvent {
  id: number
  eventType: string
  url: string
  propertyId: number | null
  createdAt: string
}

export default function VisitorListPage() {
  const [visitorIds, setVisitorIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVisitors = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/track/visitors`,
        )
        if (!response.ok) throw new Error('Falha ao buscar visitantes')
        const data = await response.json()
        setVisitorIds(data)
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }
    fetchVisitors()
  }, [])

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin/crm"
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar ao Painel CRM"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-amber-600" />
          Visitantes Anônimos (Crachás)
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {visitorIds.length > 0 ? (
              visitorIds.map((id) => (
                <li key={id}>
                  <Link
                    href={`/admin/crm/cookies/${id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-mono text-sm text-blue-600 truncate">
                      {id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ver histórico de atividade
                    </p>
                  </Link>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                Nenhum visitante anônimo encontrado.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}