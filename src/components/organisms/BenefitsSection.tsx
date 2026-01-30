'use client';

import React from 'react';
import { Bike, ShieldCheck, CreditCard, Clock } from 'lucide-react';

const benefits = [
  {
    icon: Bike,
    title: 'Entrega Rápida',
    description: 'Delivery em Ipirá e região',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: Clock,
    title: 'Atendimento Ágil',
    description: 'Resposta rápida no WhatsApp',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: CreditCard,
    title: 'Formas de Pagamento',
    description: 'PIX, Cartão e Dinheiro',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: ShieldCheck,
    title: 'Produtos Originais',
    description: 'Qualidade garantida',
    color: 'bg-purple-100 text-purple-600',
  },
];

export const BenefitsSection = () => {
  return (
    <div className="bg-transparent py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 rounded-2xl p-4 transition-colors hover:bg-gray-50 text-center sm:text-left animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${benefit.color}`}>
                <benefit.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
