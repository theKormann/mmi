'use client'

import React, { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const SparklesIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const AssistantInline: React.FC = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  
  // Histórico do chat
  const [history, setHistory] = useState<ChatMsg[]>([])
  
  // REMOVI O useRef (endRef) e o useEffect de scroll aqui

  // --- LÓGICA DE IDENTIFICAÇÃO (CRUCIAL PARA O BACKEND) ---
  const getVisitorId = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('mmi_visitor_id')
    if (!id) {
      // Gera um ID simples se não existir
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem('mmi_visitor_id', id)
    }
    return id
  }

  const suggestions = [
    '🏢 Apê 3 quartos no Centro',
    '🏡 Casa com piscina até 800k',
    '🔑 Aluguel perto do metrô',
    '💼 Sala comercial na Paulista'
  ]

  const handleSuggestion = (text: string) => {
    const cleanText = text.substring(2).trim() 
    setInput(cleanText)
  }

  const send = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || loading) return

    setHasStarted(true)
    const userMsg: ChatMsg = { role: 'user', content: textToSend.trim() }
    
    // Atualiza a UI imediatamente (Optimistic UI)
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setInput('')
    setLoading(true)

    try {
      const visitorId = getVisitorId()

      // --- CONEXÃO COM O BACKEND SPRING BOOT ---
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMsg.content,  // Mensagem atual
            visitorId: visitorId,      // ID para rastrear o lead
            history: newHistory.slice(-6) // Envia contexto (últimas 6 msgs)
        }),
      })

      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`)
      }

      const data = await res.json()
      
      const assistant: ChatMsg = {
        role: 'assistant',
        content: data.response || 'Desculpe, não entendi. Pode repetir?'
      }
      
      setHistory((h) => [...h, assistant])

      // Verifica se o backend sinalizou a criação de um lead (opcional)
      if (data.leadCreated) {
        console.log("Lead capturado com sucesso!")
      }

    } catch (error) {
      console.error("Erro ao conectar com backend:", error)
      setHistory((h) => [...h, { role: 'assistant', content: 'Ops, estou sem conexão com o servidor no momento. Verifique se o backend está rodando.' }])
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

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-500 ease-in-out ${hasStarted ? 'bg-white/90 shadow-2xl rounded-3xl p-6 border border-gray-100' : ''}`}>
      
      {/* Área do Chat (só aparece após início) */}
      {hasStarted && (
        <div className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#0C2D5A] text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          {/* Removi a div de referência (endRef) */}
        </div>
      )}

      {/* Input Principal */}
      <div className="relative group z-20">
        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 ${hasStarted ? 'hidden' : ''}`}></div>
        <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          
          <div className="pl-5 text-gray-400">
             <SparklesIcon />
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={hasStarted ? "Responda à IA..." : "Descreva seu imóvel dos sonhos..."}
            className="w-full bg-transparent border-none px-4 py-4 text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            autoComplete="off"
          />
          
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="mr-2 p-2.5 rounded-full bg-[#0C2D5A] text-white hover:bg-[#1F4F91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <SendIcon />
            )}
          </button>
        </div>
      </div>

      {/* Sugestões (Chips) */}
      {!hasStarted && (
        <div className="mt-6 text-center animate-fade-in-up">
          <p className="text-sm text-gray-500 mb-3 font-medium">Ou tente um destes:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-sm transition-all shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AssistantInline