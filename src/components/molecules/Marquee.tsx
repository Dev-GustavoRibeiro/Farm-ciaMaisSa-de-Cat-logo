'use client';

import React from 'react';

export const Marquee = () => {
  const content = (
    <>
      <span className="mx-8">Entrega em Ipirá e Região</span>
      <span className="mx-8 text-red-300">•</span>
      <span className="mx-8">Medicamentos com Receita</span>
      <span className="mx-8 text-red-300">•</span>
      <span className="mx-8">Pedidos via WhatsApp</span>
      <span className="mx-8 text-red-300">•</span>
      <span className="mx-8">Sua Saúde em Primeiro Lugar</span>
      <span className="mx-8 text-red-300">•</span>
    </>
  );

  return (
    <div className="relative flex overflow-x-hidden bg-gradient-to-r from-red-600 to-red-700 py-3 text-sm font-bold uppercase tracking-widest text-white">
      <div className="flex whitespace-nowrap animate-marquee gpu-accelerated">
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  );
};
