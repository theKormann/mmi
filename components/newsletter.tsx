"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowRight } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Aqui você integraria com seu serviço de e-mail (Mailchimp, etc.)
    alert(`O e-mail "${email}" foi cadastrado com sucesso!`)
    setEmail("")
  }

  return (
    <section className="bg-slate-900">
      {/* Gradiente de fundo para um visual mais sofisticado */}
      <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/80 to-slate-900 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-slate-700/80 p-3 ring-1 ring-white/10">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Fique por Dentro do Mercado
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Cadastre-se para receber em primeira mão os melhores lançamentos, oportunidades e novidades do setor imobiliário.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-md flex-col gap-4 sm:flex-row"
            >
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
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="flex h-14 items-center gap-2 rounded-md bg-blue-600 px-8 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <span>Inscrever-se</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
              Sem spam. Apenas imóveis e conteúdo de qualidade.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}