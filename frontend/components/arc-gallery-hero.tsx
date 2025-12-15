'use client';

import React, { useEffect, useState, useRef } from 'react';

// Tipos para o componente
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

type Message = {
  id: string;
  role: 'ai' | 'user';
  text: string;
};

// Ícones SVG simples para não depender de bibliotecas externas
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 6v2"></path>
    <path d="M12 16v2"></path>
    <path d="M6 12h2"></path>
    <path d="M16 12h2"></path>
  </svg>
);

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
  // --- Lógica do Arco de Imagens ---
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

  // --- Lógica do Chat de IA ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', text: 'Olá! Sou seu assistente virtual. Procura casa, apartamento ou terreno hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "Ótima escolha! Temos excelentes opções nessa categoria.",
        "Entendi. Você prefere algo mais central ou em um bairro tranquilo?",
        "Vou buscar as melhores ofertas com essas características para você.",
        "Pode deixar comigo. Gostaria de agendar uma visita virtual?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: randomResponse 
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section className={`relative overflow-hidden bg-[#FFFFFF] min-h-screen flex items-center justify-center ${className}`}>
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Coluna Esquerda: Texto + Chat IA */}
          <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0 z-20 flex flex-col items-center lg:items-start">
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#000000]">
              Encontre o imóvel dos seus sonhos
            </h1>
            <p className="mt-4 text-lg text-[#4D4D4D] mb-8">
              Imóveis, apartamentos, casas e terrenos à venda e para alugar. Deixe nossa IA ajudar você.
            </p>

            {/* Componente de Chat Integrado */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[400px]">
              {/* Cabeçalho do Chat */}
              <div className="bg-[#0C2D5A] p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white font-medium flex items-center gap-2">
                  <BotIcon /> Assistente Virtual
                </span>
              </div>

              {/* Área de Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-[#1F4F91] text-white rounded-tr-none'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input do Chat */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Apartamento com 3 quartos..."
                    className="w-full bg-gray-100 text-gray-800 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#1F4F91]/50 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="absolute right-2 p-2 bg-[#0C2D5A] text-white rounded-full hover:bg-[#1F4F91] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <SendIcon />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Coluna Direita: Arco de Imagens (Mantido Original) */}
          <div className="relative hidden lg:block" style={{ height: `${dimensions.radius * 1.5}px` }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ width: `${dimensions.radius * 2}px`, height: `${dimensions.radius}px` }}>
                {images.map((src, i) => {
                  const angle = startAngle + step * i;
                  const angleRad = (angle * Math.PI) / 180;

                  const x = Math.cos(angleRad) * dimensions.radius;
                  const y = -Math.sin(angleRad) * dimensions.radius;

                  return (
                    <div
                      key={i}
                      className="absolute opacity-0 animate-fade-in-up"
                      style={{
                        width: dimensions.cardSize,
                        height: dimensions.cardSize,
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% - ${y}px)`,
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArcGalleryHero;