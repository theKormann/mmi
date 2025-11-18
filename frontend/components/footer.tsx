import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react"
import Link from "next/link"
import Image from "next/image" 

export default function Footer() {
  const companyName = "MMI Imóveis"
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 text-center md:text-left">

          <div>
            <div className="flex justify-center md:justify-start mb-3">
              <Image
                src="/mmi-logo.png"
                alt="MMI Imobiliária Logo"
                width={140}
                height={40}
                className="h-20 w-auto"
              />
            </div>

            <p className="text-[#4D4D4D] mb-5 text-sm leading-relaxed mx-auto md:mx-0 max-w-xs">
              Encontre seu imóvel ideal.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-auto">
              <a href="#" aria-label="Facebook" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Instagram" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4 text-[#000000] tracking-wider uppercase">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Início</Link></li>
              <li><Link href="/comprar" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Comprar</Link></li>
              <li><Link href="/alugar" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Alugar</Link></li>
              <li><Link href="/sobre" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4 text-[#000000] tracking-wider uppercase">Para Proprietários</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/anuncie-seu-imovel" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Anuncie seu Imóvel</Link></li>
              <li><Link href="/avaliacao-gratuita" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Avaliação Gratuita</Link></li>
              <li><Link href="/gerenciar-anuncio" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">Gerenciar Anúncio</Link></li>
              <li><Link href="/faq-proprietarios" className="text-[#4D4D4D] hover:text-[#1F4F91] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4 text-[#000000] tracking-wider uppercase">Informações de Contato</h4>
            <div className="space-y-3 text-sm text-[#4D4D4D]">
              <div className="flex items-start justify-center md:justify-start gap-3">
                <MapPin className="w-5 h-5 text-[#0C2D5A] mt-0.5 flex-shrink-0" />
                <span>Estrada Dom João Nery, 223 - Itaim Paulista, São Paulo - SP, 08110-000</span>
              </div>
              <div className="flex items-start justify-center md:justify-start gap-3">
                <Phone className="w-5 h-5 text-[#0C2D5A] mt-0.5 flex-shrink-0" />
                <a href="tel:+5511982724430" className="hover:text-[#1F4F91] transition-colors">(11) 98272-4430</a>
              </div>
              <div className="flex items-start justify-center md:justify-start gap-3">
                <Mail className="w-5 h-5 text-[#0C2D5A] mt-0.5 flex-shrink-0" />
                <a href="mailto:contato@mmiimobiliaria.com.br" className="hover:text-[#1F4F91] transition-colors">moraesmendes.adm@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 text-center">
          <p className="text-sm text-[#4D4D4D]">
            © {currentYear} {companyName}. Todos os direitos reservados. | <Link href="/" className="hover:text-[#1F4F91] transition-colors">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}