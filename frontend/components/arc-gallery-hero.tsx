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

  const count = Math.max(images.length, 2);
  const step = (endAngle - startAngle) / (count - 1);

  return (
    <section className={`relative overflow-hidden bg-[#FFFFFF] min-h-screen flex items-center justify-center ${className}`}>
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute">
          {images.map((src, i) => {
            const angle = startAngle + step * i;
            const angleRad = (angle * Math.PI) / 180;

            const x = Math.cos(angleRad) * dimensions.radius;
            const y = -Math.sin(angleRad) * dimensions.radius; // Negativo para inverter o eixo Y

            return (
              <div
                key={i}
                className="absolute opacity-100 animate-fade-in-up"
                style={{
                  width: dimensions.cardSize,
                  height: dimensions.cardSize,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% - ${y}px)`, // Mudado de bottom para top
                  transform: `translate(-50%, -50%)`,
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'forwards',
                  zIndex: count - i,
                }}
              >
                <div
                  className="rounded-2xl shadow-xl overflow-hidden ring-1 ring-[#1F4F91] bg-white transition-transform hover:scale-105 w-full h-full"
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
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#000000]">
            Encontre o imóvel dos seus sonhos
          </h1>
          <p className="mt-4 text-lg text-[#4D4D4D]">
            Imóveis, apartamentos, casas e terrenos à venda e para alugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/properties" target="_blank" rel="noopener noreferrer">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0C2D5A] text-[#FFFFFF] hover:bg-[#1F4F91] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                visualizar imóveis
              </button>
            </a>
            <a
              href="https://wa.me/5511982724430?text=ol%C3%A1%20gostaria%20de%20conhecer%20algum%20im%C3%B3vel%20ideal%20para%20mim"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-block text-center px-6 py-3 rounded-full border border-[#1F4F91] text-[#1F4F91] hover:bg-[#1F4F91] hover:text-[#FFFFFF] transition-all duration-200"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcGalleryHero;