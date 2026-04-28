'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Bot, Search } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const AssistantHero: React.FC = () => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [history, setHistory] = useState<ChatMsg[]>([])
  
  // Referência para o container de scroll interno
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // CORREÇÃO: Scroll interno sem mover a página
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
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

      const data = await res.json()
      const assistant: ChatMsg = {
        role: 'assistant',
        content: data.response || 'Desculpe, não entendi.'
      }
      setHistory((h) => [...h, assistant])
    } catch (error) {
      setHistory((h) => [...h, { role: 'assistant', content: 'Erro de conexão.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Área do Chat com Scroll INTERNO Fixo */}
      {hasStarted && (
        <div 
          ref={scrollContainerRef}
          className="w-full bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-gray-100 shadow-xl mb-6 h-[400px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-4 duration-500 scroll-smooth"
        >
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 text-[#0C2D5A] sticky top-0 bg-white/10 backdrop-blur-sm z-10">
             <Bot className="w-5 h-5" />
             <span className="font-bold text-sm tracking-wide uppercase">Assistente MMI</span>
          </div>
          
          <div className="space-y-4">
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
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
                <div className="bg-gray-100 px-5 py-3 rounded-2xl rounded-bl-none border border-gray-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input de Busca (Sempre visível abaixo do chat) */}
      <div className="relative w-full group">
        <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
          <div className="hidden sm:flex pl-4 text-gray-400 items-center gap-2 border-r border-gray-100 mr-4 pr-4">
             <Search className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Smart</span>
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="O que você procura hoje?"
            className="w-full bg-transparent border-none py-4 px-2 text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 font-medium"
          />
          
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="bg-[#0C2D5A] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AssistantHero