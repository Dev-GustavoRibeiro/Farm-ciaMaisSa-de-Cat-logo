'use client';

import React, { useEffect, useState } from 'react';
import { Star, Quote, MessageSquare, Heart } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { Testimonial } from '@/types/database';

export const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-24 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
            <Heart size={16} className="text-red-400" />
            <span className="text-sm font-medium text-red-300">Avaliações de clientes</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl">
            O que dizem nossos clientes
          </h2>
          <p className="mt-4 text-blue-200/80">
            A confiança de Ipirá em cuidar da sua saúde com a gente!
          </p>
        </div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto">
          {/* Depoimentos */}
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-blue-900/30 p-6 h-44" />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {testimonials.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  className="relative rounded-2xl bg-white/5 backdrop-blur-sm p-5 border border-white/10 hover:bg-white/10 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < item.rating ? 'currentColor' : 'none'} 
                          className={i < item.rating ? 'text-yellow-400' : 'text-blue-700'} 
                        />
                      ))}
                    </div>
                    <Quote className="text-blue-700/50" size={20} />
                  </div>
                  
                  <p className="text-sm text-blue-100/90 leading-relaxed mb-4 line-clamp-3">
                    "{item.comment}"
                  </p>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                      {item.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.customer_name}</h4>
                      <span className="text-xs text-blue-400">Ipirá - BA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 mb-10">
              <div className="w-16 h-16 rounded-full bg-blue-800/50 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Seja o primeiro a avaliar!</h4>
              <p className="text-blue-300 text-sm text-center max-w-sm">
                Compartilhe sua experiência com a Farmácia Mais Saúde
              </p>
            </div>
          )}

          {/* Formulário de Feedback - Centralizado */}
          <div className="max-w-md mx-auto">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
};
