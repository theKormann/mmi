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
  radiusLg = 420,
  radiusMd = 340,
  radiusSm = 240,
  cardSizeLg = 116,
  cardSizeMd = 96,
  cardSizeSm = 80,
  className = '',
}) => {
  // Responsividade do arco
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
  const arcHeight = Math.round(dimensions.radius * 1.05)

  return (
    <section
      className={`relative bg-background overflow-hidden ${className}`}
      style={{ paddingTop: arcHeight + 32 }} // espaço para o arco
    >
      {/* Arco centralizado global (não em coluna) */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 w-full max-w-6xl"
        style={{ height: arcHeight }}
        aria-hidden
      >
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2">
          {images.map((src, i) => {
            const angle = startAngle + step * i
            const rad = (angle * Math.PI) / 180
            const x = Math.cos(rad) * dimensions.radius
            const y = Math.sin(rad) * dimensions.radius // usamos bottom + y
            return (
              <div
                key={i}
                className="absolute opacity-0 animate-fade-in-up"
                style={{
                  width: dimensions.card,
                  height: dimensions.card,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: 'translate(-50%, 50%)',
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div
                  className="w-full h-full rounded-2xl overflow-hidden shadow-xl ring-1 ring-border bg-card transition-transform duration-200 hover:scale-105"
                  style={{ transform: `rotate(${angle / 5}deg)` }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conteúdo central */}
      <div className="relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Diga o que você procura e a nossa IA te guia até as melhores opções.
            </p>

            {/* Assistente inline mais leve */}
            <div className="mt-8">
              <AssistantInline />
            </div>

            {/* Ações rápidas */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/properties"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-lg"
              >
                Ver imóveis
              </a>
              <a
                href="https://wa.me/5511982724430?text=Olá!%20Quero%20ajuda%20para%20encontrar%20um%20imóvel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 border border-border hover:bg-accent hover:text-accent-foreground transition"
              >
                Falar com um corretor
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArcGalleryHero