'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Sparkles, Send, Bot } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type ChatMsg = { role: 'user' | 'assistant'; content: string }

const AssistantInline: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [history, setHistory] = useState<ChatMsg[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Rola o chat para baixo automaticamente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading, isOpen])

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
    '🏢 Apê 3 quartos no Centro',
    '🏡 Casa com piscina até 800k',
    '🔑 Aluguel perto do metrô',
    '💼 Sala comercial na Paulista'
  ]

  const handleSuggestion = (text: string) => {
    const cleanText = text.substring(2).trim() 
    send(cleanText)
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

      if (!res.ok) {
        throw new Error(`Erro na API: ${res.status}`)
      }

      const data = await res.json()
      
      const assistant: ChatMsg = {
        role: 'assistant',
        content: data.response || 'Desculpe, não entendi. Pode repetir?'
      }
      
      setHistory((h) => [...h, assistant])

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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      
      {/* Botão Flutuante (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 ${
          isOpen 
            ? 'bg-white text-gray-800 rotate-90 scale-90 shadow-none border border-gray-200' 
            : 'bg-gradient-to-r from-[#0C2D5A] to-blue-600 text-white hover:shadow-blue-500/50 rotate-0'
        }`}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-8 h-8" />}
      </button>

      {/* Janela do Chat */}
      <div
        className={`absolute bottom-20 right-0 transition-all duration-500 origin-bottom-right transform ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        } w-[340px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden`}
      >
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#0C2D5A] to-blue-600 p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white p-2 rounded-full shadow-md">
              <Bot className="w-5 h-5 text-[#0C2D5A]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">Assistente MMI</h3>
              <p className="text-blue-100 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Online agora
              </p>
            </div>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/50">
          {!hasStarted ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-gray-800">Como posso ajudar?</h4>
                <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                  Selecione uma opção ou digite o que você procura:
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 text-gray-600 text-sm transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span className="font-medium text-left">{s}</span>
                    <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div 
                    className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-[#0C2D5A] to-blue-600 text-white rounded-2xl rounded-br-sm' 
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="relative flex items-center bg-gray-50 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-inner">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Digite sua mensagem..."
              className="w-full bg-transparent border-none pl-5 pr-12 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0"
              autoComplete="off"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="absolute right-1.5 p-2 rounded-full bg-[#0C2D5A] text-white hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-[#0C2D5A] transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 translate-x-px -translate-y-px" />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">Powered by MMI AI</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantInline