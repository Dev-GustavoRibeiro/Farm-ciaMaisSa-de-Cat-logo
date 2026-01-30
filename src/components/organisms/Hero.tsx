'use client';

import React, { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, Clock, Truck, Shield } from 'lucide-react';
import { HeroThreeBackground } from './HeroThreeBackground';

// Memoize trust badges para evitar re-renders
const trustBadges = [
  { icon: Clock, text: '07h às 21h' },
  { icon: Truck, text: 'Entrega Rápida' },
  { icon: Shield, text: '100% Original' },
] as const;

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms - memoized
  const y3D = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity3D = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale3D = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  const scaleText = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const yText = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // Memoize scroll handler
  const scrollToProducts = useMemo(() => () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[100svh] overflow-hidden">
      {/* Background - Optimized with CSS containment */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001233] via-[#001845] to-[#001233] gpu-accelerated">
        {/* Gradient Orbs - Using CSS classes to avoid hydration mismatch */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[80px] animate-pulse-glow gpu-accelerated hero-orb-red" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[60px] animate-pulse-glow gpu-accelerated hero-orb-blue" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] hero-grid-pattern" />
      </div>

      {/* 3D Three.js Scene - High performance DNA + Pill */}
      <motion.div 
        style={{ y: y3D, opacity: opacity3D, scale: scale3D }}
        className="absolute inset-0 z-10 pointer-events-none gpu-accelerated"
      >
        <HeroThreeBackground />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 min-h-[100svh] flex flex-col pointer-events-none">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div 
            style={{ scale: scaleText, y: yText }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Logo SVG - Large & Prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 1, type: "spring", stiffness: 100 }}
              className="mb-4 sm:mb-5 relative flex justify-center"
            >
              {/* Glow effect behind logo */}
              <div 
                className="absolute inset-0 blur-3xl opacity-60 -z-10"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(220,38,38,0.2) 40%, transparent 70%)',
                }}
              />
              
              {/* Logo SVG - Extra Large */}
              <img
                src="/logo_completa_exata.svg"
                alt="Farmácia Mais Saúde"
                className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] max-w-[1200px] h-auto"
                style={{
                  filter: 'drop-shadow(0 0 80px rgba(255,255,255,0.5)) drop-shadow(0 0 120px rgba(220,38,38,0.4)) drop-shadow(0 15px 50px rgba(0,0,0,0.6))',
                }}
              />

              {/* Decorative line below */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 sm:w-64 md:w-80 h-1.5 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"
                style={{ boxShadow: '0 0 30px rgba(239,68,68,0.6)' }}
              />
            </motion.div>

            {/* Subtitle - More visible */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative mb-5 sm:mb-6"
            >
              <p 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-2xl mx-auto font-bold px-4 text-white"
                style={{
                  textShadow: '0 4px 20px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.8)',
                }}
              >
                Medicamentos e cuidados com{' '}
                <span 
                  className="text-red-400 font-black"
                  style={{ textShadow: '0 0 20px rgba(248,113,113,0.5), 0 2px 4px rgba(0,0,0,1)' }}
                >
                  entrega rápida
                </span>{' '}
                em Ipirá-BA.
                <br />
                <span className="text-white/90">Sua saúde em primeiro lugar.</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pointer-events-auto px-4"
            >
              <a
                href="https://wa.me/5575991357869?text=Olá! Gostaria de fazer um pedido na Farmácia Mais Saúde."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-base sm:text-lg rounded-2xl transition-transform duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Phone className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Pedir pelo WhatsApp</span>
              </a>

              <button
                onClick={scrollToProducts}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold text-base sm:text-lg rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                Ver Produtos
              </button>
            </motion.div>

            {/* Trust Badges - More visible */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base"
            >
              {trustBadges.map(({ icon: Icon, text }) => (
                <div 
                  key={text} 
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="font-bold text-white">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Transition Wave */}
      <div className="absolute -bottom-px left-0 right-0 z-30 pointer-events-none">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block" preserveAspectRatio="none">
          <path d="M0 200L48 186.7C96 173 192 147 288 138.3C384 130 480 140 576 153.3C672 167 768 183 864 183.3C960 183 1056 167 1152 156.7C1248 147 1344 143 1392 141.7L1440 140V200H1392C1344 200 1248 200 1152 200C1056 200 960 200 864 200C768 200 672 200 576 200C480 200 384 200 288 200C192 200 96 200 48 200H0Z" fill="#f9fafb"/>
        </svg>
      </div>
    </div>
  );
};
