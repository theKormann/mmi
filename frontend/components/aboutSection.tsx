import { Building2, Users, Award, TrendingUp } from "lucide-react"

export default function AboutSection() {
  const stats = [
    {
      icon: Building2,
      value: "500+",
      label: "Imóveis Disponíveis"
    },
    {
      icon: Users,
      value: "1000+",
      label: "Clientes Satisfeitos"
    },
    {
      icon: Award,
      value: "15+",
      label: "Anos de Experiência"
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: "Taxa de Satisfação"
    }
  ]

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#0C2D5A]/5 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0C2D5A] mb-4">
            Quem Somos
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Somos uma imobiliária comprometida em transformar sonhos em realidade,
            oferecendo as melhores soluções em compra, venda, locação e administração de imóveis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-[#0C2D5A]">
              Nossa Missão
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Proporcionar experiências excepcionais no mercado imobiliário,
              conectando pessoas aos seus lares ideais com transparência,
              profissionalismo e dedicação. Acreditamos que cada cliente merece
              atenção personalizada e soluções que atendam suas necessidades específicas.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Com uma equipe altamente qualificada e tecnologia de ponta,
              facilitamos todo o processo de busca, negociação e fechamento,
              garantindo segurança e tranquilidade em cada etapa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <Icon className="w-10 h-10 text-[#0C2D5A] mb-3" />
                  <div className="text-3xl font-bold text-[#0C2D5A] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h3 className="text-2xl font-semibold text-[#0C2D5A] mb-6 text-center">
            Nossos Valores
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0C2D5A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#0C2D5A]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-[#0C2D5A]">
                Excelência
              </h4>
              <p className="text-gray-600 text-sm">
                Comprometidos com a qualidade em cada serviço prestado
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0C2D5A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#0C2D5A]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-[#0C2D5A]">
                Confiança
              </h4>
              <p className="text-gray-600 text-sm">
                Transparência e honestidade em todas as relações
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0C2D5A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#0C2D5A]" />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-[#0C2D5A]">
                Inovação
              </h4>
              <p className="text-gray-600 text-sm">
                Tecnologia e processos modernos para melhor experiência
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}