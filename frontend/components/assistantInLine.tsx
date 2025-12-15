'use client'

import React, { useEffect, useRef, useState } from 'react'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const AssistantInline: React.FC = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Como você imagina o imóvel ideal? (ex.: apartamento 3 quartos na Mooca até 600 mil)' },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [history, loading])

  const chips = [
    'Comprar', 'Alugar', 'Casa', 'Apartamento', '3 quartos', '2 vagas', 'Centro', 'Até R$ 500 mil'
  ]

  const addChip = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMsg = { role: 'user', content: input.trim() }
    setHistory((h) => [...h, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, userMsg] }),
      })
      const data = await res.json().catch(() => ({}))
      const assistant: ChatMsg = {
        role: 'assistant',
        content:
          data?.response ||
          'Entendi! Prefere alguma região específica? E qual faixa de preço você tem em mente?',
      }
      setHistory((h) => [...h, assistant])
      if (data?.shouldCreateLead) {
        // opcional: dispara extração em background
        fetch('/api/lead/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...history, userMsg, assistant] }),
        }).catch(() => {})
      }
    } catch {
      setHistory((h) => [
        ...h,
        { role: 'assistant', content: 'Tive um problema ao responder agora. Pode tentar novamente?' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  // Mostra só os últimos 3 balões para manter leve
  const lastMessages = history.slice(-3)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Balão curto do assistente */}
      <div className="flex items-start gap-2 mb-3">
        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
        <div className="rounded-2xl rounded-tl-none bg-white border border-gray-200 px-4 py-3 shadow-sm text-sm text-gray-800">
          {lastMessages[0]?.content}
        </div>
      </div>

      {/* Chips de sugestão */}
      <div className="flex gap-2 flex-wrap mb-4">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => addChip(c)}
            className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs border border-gray-200 transition"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Input compacto */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Descreva seu imóvel ideal..."
          className="w-full rounded-full bg-white/80 backdrop-blur border border-gray-200 px-4 pr-12 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F91]/30"
          aria-label="Descrever imóvel"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="absolute right-1 top-1 h-9 w-9 rounded-full bg-[#0C2D5A] text-white grid place-items-center hover:bg-[#1F4F91] disabled:opacity-50"
          aria-label="Enviar"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          ) : (
            <SendIcon />
          )}
        </button>
      </div>

      {/* Última resposta curta */}
      {lastMessages.length > 1 && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium text-gray-700">IA:</span> {lastMessages[lastMessages.length - 1].content}
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}

export default AssistantInline