'use client';

import React, { useEffect, useState } from 'react';

type ArcGalleryHeroProps = {
  images: string[];
  startAngle?: number;
  endAngle?: number;
  radiusLg?: number;
  radiusMd?: number;
  radiusSm?: number;
  cardSizeLg?: number;
  cardSizeMd?: number;
  cardSizeSm?: number;
  className?: string;
};

const ArcGalleryHero: React.FC<ArcGalleryHeroProps> = ({
  images,
  startAngle = 0,
  endAngle = 360,
  radiusLg = 340,
  radiusMd = 280,
  radiusSm = 200,
  cardSizeLg = 120,
  cardSizeMd = 100,
  cardSizeSm = 80,
  className = '',
}) => {
  const [dimensions, setDimensions] = useState({
    radius: radiusLg,
    cardSize: cardSizeLg,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDimensions({ radius: radiusSm, cardSize: cardSizeSm });
      } else if (width < 1024) {
        setDimensions({ radius: radiusMd, cardSize: cardSizeMd });
      } else {
        setDimensions({ radius: radiusLg, cardSize: cardSizeLg });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [radiusLg, radiusMd, radiusSm, cardSizeLg, cardSizeMd, cardSizeSm]);

  const count = Math.max(images.length, 1);
  const step = (endAngle - startAngle) / count;

  return (
    <section className={`relative overflow-hidden bg-[#E8F1F2] min-h-screen flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute">
          {images.map((src, i) => {
            const angle = startAngle + step * i;
            const angleRad = (angle * Math.PI) / 110;

            const x = Math.cos(angleRad) * dimensions.radius;
            const y = Math.sin(angleRad) * dimensions.radius;

            return (
              <div
                key={i}
                className="absolute opacity-100 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  bottom: `${y}px`,
                  transform: `translate(-50%, 50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div
                  className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-[#247BA0] bg-white transition-transform hover:scale-105 w-full h-full"
                  style={{ transform: `rotate(${angle + 90}deg)` }}
                >
                  <img
                    src={src}
                    alt=""
                    className="block w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="text-center max-w-2xl px-6 pointer-events-auto">
          {/* Título com tamanho de fonte ajustado para telas pequenas */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#03293D]">
            Encontre o imóvel dos seus sonhos
          </h1>
          <p className="mt-4 text-lg text-[#006494]">
            Imóveis, apartamentos, casas e terrenos à venda e para alugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/properties" target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#13293D] text-[#E8F1F2] hover:bg-[#1B98E0]/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                visualizar imóveis
              </button>
            </a>
            <button className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#247BA0] text-[#247BA0] hover:bg-[#247BA0] hover:text-[#E8F1F2] transition-all duration-200">
              Contato
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcGalleryHero;