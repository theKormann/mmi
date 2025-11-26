"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight, User } from "lucide-react" // 1. Importar o ícone User
import Cookies from "js-cookie" // 2. Importar o js-cookie

export function Newsletter() {
  const [name, setName] = useState("") // 3. Adicionar estado para o nome
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false) // 4. Estado de loading
  const [message, setMessage] = useState("") // 5. Estado para mensagem de feedback

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // 6. Pegar o "crachá" (visitorId) do cookie
    const visitorId = Cookies.get("mmi_visitor_id")

    // 7. Montar o payload para enviar ao backend
    // Este DTO deve bater com o seu LeadDTO no Spring Boot
    const leadData = {
      nome: name,
      email: email,
      origem: "NEWSLETTER", // Define a origem
      status: "NOVO",      // Define um status inicial
      visitorId: visitorId || null, // Envia o ID de rastreamento
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads`, // 8. Apontar para seu endpoint de criar lead
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(leadData),
        },
      )

      if (!response.ok) {
        throw new Error("Falha ao cadastrar. Tente novamente.")
      }

      // 9. Sucesso
      setMessage(`Obrigado, ${name}! E-mail cadastrado com sucesso.`)
      setName("")
      setEmail("")
    } catch (error: any) {
      console.error("Erro no handleSubmit:", error)
      setMessage(error.message || "Erro ao cadastrar. Tente mais tarde.")
    } finally {
      setIsLoading(false) // 10. Finaliza o loading
    }
  }

  return (
    <section className="bg-slate-900">
      <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/80 to-slate-900 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            {/* ... (título e ícone Mail) ... */}
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Fique por Dentro do Mercado
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Cadastre-se para receber em primeira mão os melhores lançamentos,
              oportunidades e novidades do setor imobiliário.
            </p>

            <form
              onSubmit={handleSubmit}
              // 11. Mudar layout para vertical
              className="mx-auto mt-10 flex max-w-md flex-col gap-4"
            >
              {/* 12. CAMPO NOME */}
              <div className="relative flex-1">
                <User
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="h-14 w-full rounded-md border-slate-600 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* 13. CAMPO EMAIL */}
              <div className="relative flex-1">
                <Mail
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <Input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu melhor e-mail"
                  className="h-14 w-full rounded-md border-slate-600 bg-white/5 py-3 pl-12 pr-4 text-base text-white placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="flex h-14 items-center gap-2 rounded-md bg-blue-600 px-8 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                disabled={isLoading}
              >
                <span>{isLoading ? "Enviando..." : "Inscrever-se"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {message && (
              <p className="mt-4 text-sm text-green-400">{message}</p>
            )}

            <p className="mt-4 text-sm text-slate-400">
              Sem spam. Apenas imóveis e conteúdo de qualidade.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}