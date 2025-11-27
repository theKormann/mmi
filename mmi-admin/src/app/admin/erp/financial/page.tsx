'use client'

import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { Pencil, Trash2, ArrowLeft, DollarSign, Calendar, TrendingUp } from 'lucide-react'

// --- Interfaces ---
interface Lead {
  id: number
  nome: string
  property?: { id: number; nome: string }
}

interface Payment {
  id?: number
  valor: number
  dataRecebimento: string
  descricao: string
  lead: Lead
}

// --- Helpers ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function FinancialPage() {
  // --- Estados ---
  const [leads, setLeads] = useState<Lead[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estado do Formulário
  const [form, setForm] = useState({ valor: '', dataRecebimento: '', descricao: '', leadId: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  // Estado dos Filtros
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

  // --- Carregamento de Dados ---
  const loadData = async () => {
    try {
      setLoading(true)
      const [leadsRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/leads`),
        axios.get(`${API_URL}/api/payments`),
      ])
      setLeads(leadsRes.data)
      setPayments(paymentsRes.data)
    } catch (error) {
      console.error("Erro ao carregar dados", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // --- Lógica de Filtragem e Agregação (Core Fix) ---
  
  // 1. Filtra os pagamentos com base no Mês/Ano selecionados
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!p.dataRecebimento) return false
      const d = new Date(p.dataRecebimento)
      // Ajuste de timezone simples (split data string se vier YYYY-MM-DD) ou uso de Date UTC
      // Aqui assumindo string ISO ou YYYY-MM-DD padrão
      const paymentMonth = d.getUTCMonth() + 1 
      const paymentYear = d.getUTCFullYear()
      
      return paymentMonth === Number(selectedMonth) && paymentYear === Number(selectedYear)
    })
  }, [payments, selectedMonth, selectedYear])

  // 2. Agrega dados para o Gráfico (Soma valores por Lead) 
  const chartData = useMemo(() => {
    const aggregation: Record<string, number> = {}

    filteredPayments.forEach(p => {
      const leadName = p.lead?.nome || 'Desconhecido'
      if (!aggregation[leadName]) {
        aggregation[leadName] = 0
      }
      aggregation[leadName] += p.valor
    })

    return Object.entries(aggregation).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value) // Ordena do maior para o menor
  }, [filteredPayments])

  // 3. Calcula KPI Total
  const totalRevenue = useMemo(() => {
    return filteredPayments.reduce((acc, curr) => acc + curr.valor, 0)
  }, [filteredPayments])


  // --- Handlers ---
  const handleSavePayment = async () => {
    if (!form.leadId || !form.valor || !form.dataRecebimento) return alert('Preencha os campos obrigatórios')
    
    const lead = leads.find((l) => l.id === Number(form.leadId))
    if (!lead) return alert('Lead inválido')

    const payload = {
      valor: Number(form.valor),
      dataRecebimento: form.dataRecebimento,
      descricao: form.descricao,
      lead,
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/payments/${editingId}`, payload)
        setEditingId(null)
      } else {
        await axios.post(`${API_URL}/api/payments`, payload)
      }
      
      await loadData()
      setForm({ valor: '', dataRecebimento: '', descricao: '', leadId: '' })
    } catch (error) {
      alert('Erro ao salvar pagamento')
    }
  }

  const handleDeletePayment = async (id: number) => {
    if (confirm('Deseja realmente excluir este pagamento?')) {
      try {
        await axios.delete(`${API_URL}/api/payments/${id}`)
        loadData() // Recarrega para atualizar lista
      } catch (error) {
        alert('Erro ao excluir')
      }
    }
  }

  const handleEditPayment = (p: Payment) => {
    setEditingId(p.id!)
    // Ajuste para formatar a data para o input type="date" (YYYY-MM-DD)
    const dateStr = p.dataRecebimento.split('T')[0] 
    
    setForm({
      valor: p.valor.toString(),
      dataRecebimento: dateStr,
      descricao: p.descricao,
      leadId: p.lead.id.toString(),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/erp">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Financeiro</h1>
            <p className="text-gray-500">Gestão de recebíveis e fluxo de caixa</p>
          </div>
        </div>
        
        {/* Filtros Globais */}
        <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] border-0 focus:ring-0">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px bg-gray-200 my-2"></div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] border-0 focus:ring-0">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Receita Total ({months[Number(selectedMonth)-1]})</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalRevenue)}</h2>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
           <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Transações</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">{filteredPayments.length}</h2>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Gráfico */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Performance por Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" tickFormatter={(val) => `R$${val/1000}k`} hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Recebido']}
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]} 
                    barSize={30}
                    name="Valor Recebido"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Calendar className="w-12 h-12 mb-2 opacity-20" />
                <p>Sem dados para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coluna Direita: Formulário */}
        <Card className="h-fit shadow-md">
          <CardHeader className="bg-gray-50/50 border-b">
            <CardTitle className="text-lg font-semibold">
              {editingId ? '✏️ Editar Lançamento' : '➕ Novo Lançamento'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Cliente / Lead</Label>
              <Select 
                value={form.leadId} 
                onValueChange={(v) => setForm({ ...form, leadId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={String(lead.id)}>
                      {lead.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">R$</span>
                  <Input
                    type="number"
                    className="pl-9"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.dataRecebimento}
                  onChange={(e) => setForm({ ...form, dataRecebimento: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição (Opcional)</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Parcela 1 - Imóvel X"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button className="w-full" onClick={handleSavePayment}>
                {editingId ? 'Salvar' : 'Registrar'}
              </Button>
              {editingId && (
                <Button 
                  variant="outline" 
                  onClick={() => { setEditingId(null); setForm({ valor: '', dataRecebimento: '', descricao: '', leadId: '' }) }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Extrato Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum registro encontrado.</td>
                   </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        {new Date(p.dataRecebimento).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 font-medium text-gray-900">{p.lead.nome}</td>
                      <td className="p-4 text-gray-500">{p.descricao || '-'}</td>
                      <td className="p-4 text-right font-semibold text-green-600">
                        {formatCurrency(p.valor)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditPayment(p)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeletePayment(p.id!)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}