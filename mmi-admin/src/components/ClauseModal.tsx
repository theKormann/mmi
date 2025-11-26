'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Clause } from '../../services/api'

interface ClauseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Clause, 'id'>) => void
  clauseToEdit: Clause | null
}

export default function ClauseModal({
  isOpen,
  onClose,
  onSave,
  clauseToEdit,
}: ClauseModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (clauseToEdit) {
      setTitle(clauseToEdit.title)
      setContent(clauseToEdit.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [clauseToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, content })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">
          {clauseToEdit ? 'Editar Cláusula' : 'Nova Cláusula'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da cláusula"
            required
            className="border rounded-md p-2"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conteúdo da cláusula"
            required
            rows={6}
            className="border rounded-md p-2 resize-none"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}
