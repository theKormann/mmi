"use client"

import { Building2, Users, Award, TrendingUp, Sparkles, ShieldCheck, Zap } from "lucide-react"

export default function AboutSection() {
  const stats = [
    {
      icon: Building2,
      value: "10+",
      label: "Imóveis Disponíveis"
    },
    {
      icon: Users,
      value: "1000+",
      label: "Clientes Satisfeitos"
    },
    {
      icon: Award,
      value: "25+",
      label: "Anos de Experiência"
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Taxa de Satisfação"
    }
  ]

  return (
    <section id="about-section" className="relative py-24 px-4 overflow-hidden bg-slate-50">
      {/* Elementos Decorativos de Fundo (Essenciais para o Glassmorphism brilhar) */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-600">Nossa Essência</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-[#0C2D5A] mb-6 tracking-tight">
            Quem Somos
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Somos uma imobiliária comprometida em transformar sonhos em realidade,
            oferecendo as melhores soluções em compra, venda, locação e administração de imóveis com tecnologia e calor humano.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          
          {/* Texto - Nossa Missão */}
          <div className="space-y-6 bg-white/40 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-3xl font-bold text-[#0C2D5A] flex items-center gap-3">
              Nossa Missão
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg">
              Proporcionar experiências excepcionais no mercado imobiliário,
              conectando pessoas aos seus lares ideais com transparência,
              profissionalismo e dedicação. Acreditamos que cada cliente merece
              atenção personalizada e soluções que atendam suas necessidades específicas.
            </p>
            <p className="text-slate-700 leading-relaxed text-lg">
              Com uma equipe altamente qualificada e tecnologia de ponta,
              facilitamos todo o processo de busca, negociação e fechamento,
              garantindo segurança e tranquilidade em cada etapa da sua jornada.
            </p>
          </div>

          {/* Grid de Estatísticas (Cards Glassmorphism) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="group bg-white/60 backdrop-blur-lg p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0C2D5A] mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Nossos Valores */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-10 md:p-16 relative overflow-hidden">
          {/* Efeito de brilho interno no card grande */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-white/40 blur-2xl"></div>
          
          <h3 className="text-3xl font-bold text-[#0C2D5A] mb-12 text-center relative z-10">
            Nossos Valores
          </h3>
          
          <div className="grid md:grid-cols-3 gap-10 relative z-10">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white group-hover:rotate-6 transition-transform duration-300">
                <Award className="w-10 h-10 text-[#0C2D5A]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#0C2D5A]">
                Excelência
              </h4>
              <p className="text-slate-600 font-medium">
                Comprometidos com a máxima qualidade em cada detalhe do serviço prestado.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white group-hover:rotate-6 transition-transform duration-300">
                <ShieldCheck className="w-10 h-10 text-[#0C2D5A]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#0C2D5A]">
                Confiança
              </h4>
              <p className="text-slate-600 font-medium">
                Transparência total, honestidade e segurança jurídica em todas as relações.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-white group-hover:rotate-6 transition-transform duration-300">
                <Zap className="w-10 h-10 text-[#0C2D5A]" />
              </div>
              <h4 className="font-bold text-xl mb-3 text-[#0C2D5A]">
                Inovação
              </h4>
              <p className="text-slate-600 font-medium">
                Tecnologia e processos ágeis para garantir a melhor e mais rápida experiência.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}