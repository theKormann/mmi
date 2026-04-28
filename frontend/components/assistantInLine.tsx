'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Bot, Building2, MapPin, Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const AssistantHero: React.FC = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [history, setHistory] = useState<ChatMsg[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasStarted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, loading])

  const getVisitorId = () => {
    if (typeof window === 'undefined') return ''
    let id = localStorage.getItem('mmi_visitor_id')
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem('mmi_visitor_id', id)
    }
    return id
  }

  const suggestions = [
    { text: '🏢 Apê 3 quartos no Centro', value: 'Apartamento 3 quartos no centro' },
    { text: '🏡 Casa com piscina até 800k', value: 'Casa com piscina até 800 mil reais' },
    { text: '🔑 Aluguel perto do metrô', value: 'Aluguel de imóvel próximo ao metrô' },
    { text: '💼 Sala comercial na Paulista', value: 'Sala comercial na Avenida Paulista' }
  ]

  const send = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || loading) return

    setHasStarted(true)
    const userMsg: ChatMsg = { role: 'user', content: textToSend.trim() }
    
    const newHistory = [...history, userMsg]
    setHistory(newHistory)
    setInput('')
    setLoading(true)

    try {
      const visitorId = getVisitorId()
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: userMsg.content,
            visitorId: visitorId,
            history: newHistory.slice(-6)
        }),
      })

      if (!res.ok) throw new Error(`Erro: ${res.status}`)

      const data = await res.json()
      const assistant: ChatMsg = {
        role: 'assistant',
        content: data.response || 'Não consegui processar agora. Pode tentar de novo?'
      }
      setHistory((h) => [...h, assistant])
    } catch (error) {
      console.error(error)
      setHistory((h) => [...h, { role: 'assistant', content: 'Desculpe, estou com problemas de conexão. Verifique se o servidor está ativo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center">
      
      {/* Título de Impacto (Só aparece se não começou o chat) */}
      {!hasStarted && (
        <div className="text-center mb-10 animate-in fade-in zoom-in duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0C2D5A] mb-6 tracking-tight leading-tight">
            Seu próximo imóvel está a <br/>
            <span className="text-blue-600 bg-clip-text">uma conversa de distância.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Esqueça filtros complexos. Diga à nossa IA o que você procura e nós encontramos para você.
          </p>
        </div>
      )}

      {/* Container Principal do Chat/Hero */}
      <div className={`w-full transition-all duration-700 ease-in-out ${hasStarted ? 'bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 min-h-[500px]' : ''}`}>
        
        {/* Histórico do Chat (Ocupa o espaço central se iniciado) */}
        {hasStarted && (
          <div className="mb-8 space-y-6 max-h-[400px] overflow-y-auto px-2 custom-scrollbar">
            <div className="flex justify-start items-center gap-3 text-blue-600 font-medium pb-4 border-b border-gray-50">
               <Bot className="w-6 h-6" /> 
               <span>Assistente Inteligente MMI</span>
            </div>
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-2xl shadow-sm text-base ${
                    msg.role === 'user' 
                      ? 'bg-[#0C2D5A] text-white rounded-br-none' 
                      : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 px-6 py-4 rounded-2xl rounded-bl-none border border-gray-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input de Busca Estilo Hero */}
        <div className="relative w-full group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl blur-lg transition group-hover:opacity-100 opacity-50 ${hasStarted ? 'hidden' : ''}`}></div>
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-gray-200 p-2 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
            
            <div className="hidden sm:flex pl-4 text-gray-400 items-center gap-2 border-r border-gray-100 mr-4 pr-4">
               <Search className="w-6 h-6" />
               <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Smart Search</span>
            </div>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ex: Procuro um sobrado em São Miguel com 3 suítes e vaga..."
              className="w-full bg-transparent border-none py-4 px-2 text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            />
            
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="bg-[#0C2D5A] text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span className="hidden sm:inline">Buscar</span> <Send className="w-5 h-5" /></>}
            </button>
          </div>
        </div>

        {/* Sugestões (Chips) embaixo do input */}
        {!hasStarted && (
          <div className="mt-8 w-full animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.value)}
                  className="px-5 py-2.5 rounded-full bg-gray-100/50 backdrop-blur-sm border border-gray-200 text-gray-600 text-sm hover:bg-white hover:border-blue-400 hover:text-blue-700 hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas/Badges de confiança embaixo do Hero */}
      {!hasStarted && (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            <div className="flex flex-col items-center"><p className="text-2xl font-bold text-[#0C2D5A]">500+</p><p className="text-xs uppercase tracking-widest">Imóveis</p></div>
            <div className="flex flex-col items-center"><p className="text-2xl font-bold text-[#0C2D5A]">24h</p><p className="text-xs uppercase tracking-widest">Suporte IA</p></div>
            <div className="flex flex-col items-center"><p className="text-2xl font-bold text-[#0C2D5A]">100%</p><p className="text-xs uppercase tracking-widest">Seguro</p></div>
            <div className="flex flex-col items-center"><p className="text-2xl font-bold text-[#0C2D5A]">Zero</p><p className="text-xs uppercase tracking-widest">Complexidade</p></div>
        </div>
      )}
    </div>
  )
}

export default AssistantHero