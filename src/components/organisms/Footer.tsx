'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MapPin, Phone, Clock, ArrowUp } from 'lucide-react';
import { Category } from '@/types/database';
import { TestimonialsSection } from './TestimonialsSection';

interface FooterProps {
  categories: Category[];
}

export const Footer: React.FC<FooterProps> = ({ categories }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-blue-950 to-[#002366] text-white overflow-hidden">
      {/* Decorative Elements - Optimized blur */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none gpu-accelerated" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 blur-[60px] rounded-full pointer-events-none gpu-accelerated" />

      {/* Testimonials Section Joined */}
      <TestimonialsSection />

      {/* CTA Section */}
      <div className="relative border-y border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">
            <div className="flex flex-col gap-3 sm:gap-4 text-center lg:text-left max-w-2xl">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Cuidar da sua saúde <br className="hidden sm:block"/>
                <span className="text-red-500">nunca foi tão fácil.</span>
              </h3>
              <p className="text-base sm:text-lg text-blue-200/80">
                Faça seu pedido agora pelo WhatsApp e receba no conforto da sua casa.
              </p>
            </div>
            
            <a 
              href="https://wa.me/5575991357869?text=Olá! Gostaria de fazer um pedido na Farmácia Mais Saúde."
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#002366] font-black text-base sm:text-lg rounded-2xl transition-all hover:scale-105 hover:bg-red-600 hover:text-white shadow-xl shadow-black/20 text-center"
            >
              Falar no WhatsApp
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-green-500 border-2 border-[#002366]" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
          
          {/* Brand Column */}
          <div className="space-y-5 sm:space-y-6 text-center sm:text-left">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="relative w-32 h-12 sm:w-40 sm:h-16 transition-all hover:opacity-90 hover:scale-105 cursor-pointer mx-auto sm:mx-0"
            >
              <Image 
                src="/logo.png" 
                alt="Farmácia Mais Saúde" 
                fill 
                className="object-contain sm:object-left"
              />
            </button>
            
            <p className="text-blue-200/70 leading-relaxed text-sm sm:text-base max-w-xs mx-auto sm:mx-0">
              Sua referência em medicamentos e perfumaria em Ipirá. 
              Compromisso com o bem-estar e qualidade de vida.
            </p>
            
            <div className="flex gap-3 sm:gap-4 justify-center sm:justify-start">
              <a href="#" className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 hover:bg-red-600 transition-all text-white group">
                <Instagram size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 hover:bg-blue-600 transition-all text-white group">
                <Facebook size={18} className="sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Categories Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 justify-center sm:justify-start">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Produtos
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={`/?category=${category.slug}`} className="text-sm sm:text-base text-blue-200/70 hover:text-white hover:translate-x-1 transition-all inline-block capitalize">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-5 sm:space-y-6 sm:col-span-2 lg:col-span-1">
            <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 justify-center sm:justify-start lg:justify-start">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Contato
            </h4>
            
            <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto sm:mx-0 lg:mx-0">
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <MapPin className="text-red-500 shrink-0 mt-0.5 w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <div className="font-bold text-white text-sm sm:text-base">Ipirá - BA</div>
                  <div className="text-xs sm:text-sm text-blue-200/70">Centro da cidade</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <Phone className="text-red-500 shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                <div className="font-bold text-white text-sm sm:text-base">(75) 99135-7869</div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <Clock className="text-red-500 shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                <div className="text-xs sm:text-sm text-blue-200/70">Seg a Sáb: 7h às 21h</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <p className="text-xs sm:text-sm text-blue-200/50 text-center sm:text-left">
              © {new Date().getFullYear()} Farmácia Mais Saúde. Todos os direitos reservados.
            </p>
            
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors"
            >
              Voltar ao topo <ArrowUp size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
