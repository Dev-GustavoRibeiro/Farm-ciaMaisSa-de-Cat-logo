'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  isLoading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  // Oculta o scroll enquanto está carregando
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-700 ${
        isLoading 
          ? 'opacity-100 visible' 
          : 'opacity-0 invisible pointer-events-none'
      }`}
      style={{
        background: 'linear-gradient(135deg, #001233 0%, #001845 40%, #1a0a0a 70%, #2d0a0a 100%)',
      }}
    >
      {/* Gradient orbs */}
      <div 
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)', animationDelay: '1s' }}
      />

      {/* Logo centralizada */}
      <div 
        className="relative z-10"
        style={{
          animation: 'logoFloat 3s ease-in-out infinite',
        }}
      >
        {/* Glow effect atrás da logo */}
        <div 
          className="absolute inset-[-30px] blur-3xl opacity-50 animate-pulse"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(220,38,38,0.2) 50%, transparent 70%)',
          }}
        />
        
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="Farmácia Mais Saúde"
          width={200}
          height={200}
          priority
          className="relative z-10"
          style={{
            animation: 'logoPulse 2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.3))',
          }}
        />
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 50px rgba(255,255,255,0.5));
          }
        }
      `}} />
    </div>
  );
};
