'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'

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

export default function FinancialPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [form, setForm] = useState({ valor: '', dataRecebimento: '', descricao: '', leadId: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'


  // --- Carrega leads e pagamentos ---
  const loadData = async () => {
    const [leadsRes, paymentsRes] = await Promise.all([
      axios.get(`${API_URL}/api/leads`),
      axios.get(`${API_URL}/api/payments`),
    ])
    console.log('Leads carregados:', leadsRes.data)
    setLeads(leadsRes.data)
    setPayments(paymentsRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSavePayment = async () => {
    const lead = leads.find((l) => l.id === Number(form.leadId))
    if (!lead) return alert('Selecione um lead válido')

    const payload = {
      valor: Number(form.valor),
      dataRecebimento: form.dataRecebimento,
      descricao: form.descricao,
      lead,
    }

    if (editingId) {
      await axios.put(`${API_URL}/api/payments/${editingId}`, payload)
      setEditingId(null)
    } else {
      await axios.post(`${API_URL}/api/payments`, payload)
    }

    await loadData()
    setForm({ valor: '', dataRecebimento: '', descricao: '', leadId: '' })
  }

  const handleDeletePayment = async (id: number) => {
    if (confirm('Deseja realmente excluir este pagamento?')) {
      await axios.delete(`${API_URL}/api/payments/${id}`)
      await loadData()
    }
  }

  const handleEditPayment = (p: Payment) => {
    setEditingId(p.id!)
    setForm({
      valor: p.valor.toString(),
      dataRecebimento: p.dataRecebimento,
      descricao: p.descricao,
      leadId: p.lead.id.toString(),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- Gráfico mensal ---
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const monthPayments = payments.filter((p) => {
    const d = new Date(p.dataRecebimento)
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
  })


  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // --- Pagamentos do gráfico ---
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([])

  // --- Buscar pagamentos por mês/ano ---
  const loadPaymentsByMonth = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/payments/month?year=${selectedYear}&month=${selectedMonth}`
      )
      const data = res.data.map((p: Payment) => ({
        name: p.lead.nome,
        value: p.valor,
      }))
      setChartData(data)
    } catch (err) {
      console.error('Erro ao carregar pagamentos por mês:', err)
    }
  }

  // Carregar gráfico inicial (mês atual)
  useEffect(() => {
    loadPaymentsByMonth()
  }, [])

  return (
    <div className="p-6 space-y-8">
      {/* Botão de retorno */}
      <div className="flex items-center gap-3">
        <Link href="/admin/erp">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao ERP
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">💰 Controle Financeiro</h1>
      </div>

      {/* Formulário */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">
            {editingId ? 'Editar Pagamento' : 'Adicionar Pagamento'}
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Label>Lead</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, leadId: v })}
                value={form.leadId || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o lead" />
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

            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>

            <div>
              <Label>Data de Recebimento</Label>
              <Input
                type="date"
                value={form.dataRecebimento}
                onChange={(e) => setForm({ ...form, dataRecebimento: e.target.value })}
              />
            </div>

            <div>
              <Label>Imóvel / Descrição</Label>
              <Input
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Casa Jardim Europa"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSavePayment}>
              {editingId ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(null)
                  setForm({ valor: '', dataRecebimento: '', descricao: '', leadId: '' })
                }}
              >
                Cancelar Edição
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">📊 A Receber no Mês</h2>

            <div className="flex gap-3">
              {/* Filtro de Mês */}
              <Select
                onValueChange={(v) => setSelectedMonth(Number(v))}
                value={selectedMonth.toString()}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Janeiro', 'Fevereiro', 'Março', 'Abril',
                    'Maio', 'Junho', 'Julho', 'Agosto',
                    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                  ].map((m, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro de Ano */}
              <Select
                onValueChange={(v) => setSelectedYear(Number(v))}
                value={selectedYear.toString()}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={loadPaymentsByMonth}>Filtrar</Button>
            </div>
          </div>

          {(monthPayments.map((p) => ({
            name: p.lead.nome,
            value: p.valor,
          }))).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthPayments.map((p) => ({
                name: p.lead.nome,
                value: p.valor,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" barSize={40} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Nenhum pagamento encontrado para o período selecionado.</p>
          )}
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">📋 Lista de Pagamentos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Lead</th>
                  <th className="p-2 border">Descrição</th>
                  <th className="p-2 border">Valor</th>
                  <th className="p-2 border">Data</th>
                  <th className="p-2 border text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{p.lead.nome}</td>
                    <td className="p-2 border">{p.descricao}</td>
                    <td className="p-2 border">R$ {p.valor.toFixed(2)}</td>
                    <td className="p-2 border">
                      {new Date(p.dataRecebimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-2 border text-center flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPayment(p)}
                        className="flex items-center gap-1"
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePayment(p.id!)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
