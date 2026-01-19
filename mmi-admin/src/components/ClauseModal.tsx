'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2, Bold, Type } from 'lucide-react'
import { Clause } from '../../services/api'

interface ClauseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { title: string; content: string }) => Promise<void>
  clauseToEdit: Clause | null
}

export default function ClauseModal({ isOpen, onClose, onSave, clauseToEdit }: ClauseModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  // Referência para a caixa de texto para manipular a seleção
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (clauseToEdit) {
        setTitle(clauseToEdit.title)
        setContent(clauseToEdit.content)
      } else {
        setTitle('')
        setContent('')
      }
    }
  }, [isOpen, clauseToEdit])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return
    setIsSaving(true)
    await onSave({ title, content })
    setIsSaving(false)
  }

  // Função para aplicar formatação (Negrito)
  const handleBold = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // Se não tiver nada selecionado, apenas insere os asteriscos e coloca o cursor no meio
    if (start === end) {
      const newText = content.substring(0, start) + "**" + content.substring(end)
      setContent(newText)
      
      // Recoloca o foco e o cursor no meio dos asteriscos
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + 1, start + 1)
      }, 0)
      return
    }

    // Se tiver texto selecionado, envolve com *
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end)
    
    setContent(newText)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {clauseToEdit ? 'Editar Cláusula' : 'Nova Cláusula'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
              Título da Cláusula
            </label>
            <input
              type="text"
              placeholder="Ex: Do Pagamento"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Conteúdo com Toolbar */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">
                Conteúdo do Texto
              </label>
              
              {/* Toolbar Simples */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={handleBold}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm"
                  title="Negrito (Selecionar texto)"
                  type="button"
                >
                  <Bold className="w-4 h-4" />
                </button>
                {/* Aqui você pode adicionar mais botões no futuro */}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={12}
                placeholder="Digite o texto da cláusula aqui... Selecione uma parte e clique em 'B' para negrito."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none font-sans leading-relaxed"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                Use o botão <b>B</b> para destacar valores ou datas importantes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isSaving}
            className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {clauseToEdit ? 'Salvar Alterações' : 'Criar Cláusula'}
          </button>
        </div>
      </div>
    </div>
  )
}