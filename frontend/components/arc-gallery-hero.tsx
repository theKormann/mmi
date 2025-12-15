'use client'

import React, { useEffect, useState } from 'react'
import AssistantInline from '././assistantInLine'

type ArcGalleryHeroProps = {
  images: string[]
  startAngle?: number
  endAngle?: number
  radiusLg?: number
  radiusMd?: number
  radiusSm?: number
  cardSizeLg?: number
  cardSizeMd?: number
  cardSizeSm?: number
  className?: string
}

const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = -110,
  endAngle = 110,
  radiusLg = 450, // Aumentei um pouco para afastar do texto
  radiusMd = 360,
  radiusSm = 260,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
}) => {
  const [dimensions, setDimensions] = useState({ radius: radiusLg, card: cardSizeLg })

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      if (w < 640) setDimensions({ radius: radiusSm, card: cardSizeSm })
      else if (w < 1024) setDimensions({ radius: radiusMd, card: cardSizeMd })
      else setDimensions({ radius: radiusLg, card: cardSizeLg })
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm])

  const count = Math.max(images.length, 2)
  const step = (endAngle - startAngle) / (count - 1)
  // Reduzi o padding top para o arco ficar mais "atrás" do conteúdo visualmente se necessário
  const arcHeight = Math.round(dimensions.radius * 0.95) 

  return (
    <section className={`relative bg-slate-50 overflow-hidden min-h-[700px] flex flex-col justify-center ${className}`}>
      
      {/* ARCO DE FUNDO 
         Adicionei 'opacity-60' e 'blur-[1px]' para ele não competir com o texto.
         Adicionei um mask-image linear para fazer os cards sumirem suavemente na parte inferior.
      */}
      <div 
        className="absolute inset-x-0 top-0 pointer-events-none select-none z-0"
        style={{ 
          height: arcHeight + 100,
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', 
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-6xl h-full opacity-60 grayscale-[30%] blur-[0.5px]">
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
            {images.map((src, i) => {
                const angle = startAngle + step * i
                const rad = (angle * Math.PI) / 180
                const x = Math.cos(rad) * dimensions.radius
                const y = Math.sin(rad) * dimensions.radius
                return (
                <div
                    key={i}
                    className="absolute animate-fade-in-up"
                    style={{
                    width: dimensions.card,
                    height: dimensions.card,
                    left: `calc(50% + ${x}px)`,
                    bottom: `${y}px`,
                    transform: 'translate(-50%, 50%)',
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: 'forwards',
                    }}
                >
                    <div
                    className="w-full h-full rounded-xl overflow-hidden shadow-lg bg-white rotate-0 opacity-0 animate-scale-in"
                    style={{ 
                        transform: `rotate(${angle + 90}deg)`, // Ajuste na rotação para ficarem "olhando" pro centro
                        animationDelay: `${i * 100}ms`,
                        animationFillMode: 'forwards'
                    }} 
                    >
                    <img src={src} alt="" className="w-full h-full object-cover opacity-90" draggable={false} />
                    </div>
                </div>
                )
            })}
            </div>
        </div>
      </div>

      {/* Conteúdo Central - Z-INDEX maior para ficar sobre o arco */}
      <div className="relative z-10 container mx-auto px-4 mt-20 sm:mt-0">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          <div className="space-y-4">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase">
              Nova Era Imobiliária
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Seu novo imóvel começa com uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">conversa</span>.
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Esqueça os filtros complicados. Nossa Inteligência Artificial encontra as melhores oportunidades no mercado baseada no que você realmente quer.
            </p>
          </div>

          {/* O Chat agora é o único foco de ação */}
          <div className="pt-4 pb-12">
            <AssistantInline />
          </div>

        </div>
      </div>
    </section>
  )
}

export default ArcGalleryHero