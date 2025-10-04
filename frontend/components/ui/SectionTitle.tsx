import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2 // Alterado para h2 para melhor semântica, já que h1 geralmente é o título principal da página
      className={`
        text-center text-3xl font-bold tracking-tight text-slate-900 
        sm:text-4xl lg:text-5xl 
        ${className}
      `}
    >
      {children}
    </h2>
  );
}