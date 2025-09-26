import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const companyName = "MMI Imobiliária"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-200 py-12"> {/* Reduzido o padding vertical */}
      <div className="container mx-auto px-4 max-w-6xl"> {/* Container mais estreito e centralizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 text-center md:text-left"> {/* Ajustado gap */}
          
          {/* Coluna 1: Branding e Redes Sociais */}
          <div>
            <h3 className="text-2xl font-bold mb-3 text-slate-900">{companyName}</h3> {/* Ajustado mb */}
            <p className="text-slate-600 mb-5 text-sm leading-relaxed mx-auto md:mx-0 max-w-xs"> {/* Ajustado mb e max-w */}
              Encontre seu imóvel ideal.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-auto"> {/* Centralizado em mobile, à esquerda em md+ */}
              <a href="#" aria-label="Facebook" className="text-slate-500 hover:text-blue-600 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-slate-500 hover:text-blue-600 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-500 hover:text-blue-600 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-slate-900 tracking-wider uppercase">Navegação</h4> {/* Ajustado mb */}
            <ul className="space-y-2 text-sm"> {/* Ajustado space-y e text-sm */}
              <li><Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors">Início</Link></li>
              <li><Link href="/comprar" className="text-slate-600 hover:text-blue-600 transition-colors">Comprar</Link></li>
              <li><Link href="/alugar" className="text-slate-600 hover:text-blue-600 transition-colors">Alugar</Link></li>
              <li><Link href="/sobre" className="text-slate-600 hover:text-blue-600 transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="text-slate-600 hover:text-blue-600 transition-colors">Contato</Link></li>
            </ul>
          </div>
          
          {/* Coluna 3: Para Proprietários */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-slate-900 tracking-wider uppercase">Para Proprietários</h4> {/* Ajustado mb */}
            <ul className="space-y-2 text-sm"> {/* Ajustado space-y e text-sm */}
              <li><Link href="/anuncie-seu-imovel" className="text-slate-600 hover:text-blue-600 transition-colors">Anuncie seu Imóvel</Link></li>
              <li><Link href="/avaliacao-gratuita" className="text-slate-600 hover:text-blue-600 transition-colors">Avaliação Gratuita</Link></li>
              <li><Link href="/gerenciar-anuncio" className="text-slate-600 hover:text-blue-600 transition-colors">Gerenciar Anúncio</Link></li>
              <li><Link href="/faq-proprietarios" className="text-slate-600 hover:text-blue-600 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Coluna 4: Informações de Contato */}
          <div>
            <h4 className="text-base font-semibold mb-4 text-slate-900 tracking-wider uppercase">Informações de Contato</h4> {/* Ajustado mb */}
            <div className="space-y-3 text-sm text-slate-600"> {/* Ajustado space-y e text-sm */}
              <div className="flex items-start justify-center md:justify-start gap-3"> {/* Centralizado em mobile, à esquerda em md+ */}
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Estrada Dom João Nery, 223 - Itaim Paulista, São Paulo - SP, 08110-000</span>
              </div>
              <div className="flex items-start justify-center md:justify-start gap-3"> {/* Centralizado em mobile, à esquerda em md+ */}
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <a href="tel:+5511982724430" className="hover:text-blue-600 transition-colors">(11) 98272-4430</a>
              </div>
              <div className="flex items-start justify-center md:justify-start gap-3"> {/* Centralizado em mobile, à esquerda em md+ */}
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <a href="mailto:contato@mmiimobiliaria.com.br" className="hover:text-blue-600 transition-colors">contato@mmiimobiliaria.com.br</a>
              </div>
            </div>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-slate-200 mt-10 pt-6 text-center"> {/* Ajustado mt e pt */}
          <p className="text-sm text-slate-500">
            © {currentYear} {companyName}. Todos os direitos reservados. | <Link href="/privacidade" className="hover:text-blue-600 transition-colors">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}