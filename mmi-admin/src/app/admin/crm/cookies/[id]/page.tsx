'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Fingerprint, Loader2 } from 'lucide-react'

interface TrackingEvent {
  id: number
  eventType: string
  url: string
  propertyId: number | null
  createdAt: string
  lead: { id: number; nome: string } | null
  ipAddress?: string
  country?: string
  region?: string
  city?: string
}

interface VisitorDetailPageProps {
  params: {
    id: string
  }
}

export default function VisitorDetailPage({ params }: VisitorDetailPageProps) {
  const { id: visitorId } = params
  const [history, setHistory] = useState<TrackingEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!visitorId) return

    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/track/visitor/${visitorId}`,
        )
        if (!response.ok) throw new Error('Falha ao buscar histórico')
        const data: TrackingEvent[] = await response.json()
        setHistory(data)
      } catch (error) {
        console.error(error)
      }
      setIsLoading(false)
    }

    fetchHistory()
  }, [visitorId])

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="flex items-center gap-4 mb-10">
        <Link
          href="/admin/crm/cookies"
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Voltar para Visitantes"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Fingerprint className="w-8 h-8 text-amber-600" />
          Histórico do Visitante
        </h1>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">ID do Crachá (Visitor ID):</p>
        <p className="font-mono text-lg text-black break-all">{visitorId}</p>
      </div>

      <div className="bg-white shadow-lg rounded-xl border border-gray-100">
        <h3 className="text-xl font-semibold p-4 border-b">
          Atividade Registrada
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((event) => (
                <li key={event.id} className="p-4">
                  <p className="font-medium">
                    {event.eventType === 'PROPERTY_VIEW'
                      ? `Viu o imóvel #${event.propertyId}`
                      : 'Navegou para'}
                  </p>

                  <p className="text-sm text-blue-600 font-mono">{event.url}</p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.createdAt).toLocaleString('pt-BR')}
                  </p>

                  {(event.city || event.region || event.country) && (
                    <>
                      <p className="text-xs text-amber-600 mt-1">
                        🌎{' '}
                        {event.city && `${event.city}, `}
                        {event.region && `${event.region} - `}
                        {event.country}
                      </p>

                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            `${event.city ?? ''}, ${event.country ?? ''}`,
                          )}&output=embed`}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                      </div>
                    </>
                  )}

                  {event.ipAddress && (
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {event.ipAddress}
                    </p>
                  )}

                  {event.lead && (
                    <p className="text-xs text-green-600 mt-1">
                      Associado ao Lead: {event.lead.nome} (ID: {event.lead.id})
                    </p>
                  )}
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                Nenhuma atividade registrada para este visitante.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
