"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Settings, ExternalLink } from "lucide-react"
import { useState } from "react"

export function SetupTooltip() {
  // MUDANÇA: alterado de 'true' para 'false' para começar fechado
  const [isOpen, setIsOpen] = useState(false)

  const whatsappNumber = "5511982724430"; 
  const whatsappMessage = "Olá! Gostaria de anunciar meu imóvel no seu catálogo. Poderia me ajudar com a configuração?";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsOpen(true)} className="bg-black text-white hover:bg-black/90 shadow-lg" size="lg">
          <Settings className="w-4 h-4 mr-2" />
          Anuncie seu Imóvel
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed z-50 bottom-0 left-0 right-0 w-full md:bottom-4 md:right-4 md:left-auto md:w-96">
      <Card 
        className="shadow-2xl rounded-none border-t-2 border-black 
                   md:rounded-lg md:border-2"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <CardTitle className="text-lg">Anuncie seu Imóvel</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Fale conosco diretamente para anunciar seu imóvel e exibi-lo no nosso catálogo.
          </p>
          <Button 
            asChild 
            className="w-full bg-[#128C7E] text-white hover:bg-[#25D366] flex items-center justify-center transition-colors"
          >
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              Falar com Consultor
              <ExternalLink className="ml-2 w-3 h-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}