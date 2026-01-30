'use client';

import React, { useState, useEffect } from 'react';
import { X, Share, Plus, Check } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está em modo standalone (já instalado)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return;

    // Verifica se é iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    // Verifica se já instalou (marcado pelo usuário)
    const installed = localStorage.getItem('appInstalled') === 'true';
    if (installed) return;

    // Verifica se já foi descartado recentemente
    const dismissed = localStorage.getItem('installPromptDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Mostra o prompt após 5 segundos
    const timer = setTimeout(() => {
      if (dismissedTime < oneDayAgo) {
        setShowPrompt(true);
      }
    }, 5000);

    // Captura o evento beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('appInstalled', 'true');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleIOSInstalled = () => {
    // Usuário confirma que instalou no iOS
    localStorage.setItem('appInstalled', 'true');
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  // Banner para iOS - centralizado e explicativo
  if (isIOS) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div 
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
          style={{ animation: 'scaleIn 0.3s ease-out' }}
        >
          {/* Header com logo */}
          <div className="bg-gradient-to-br from-[#001233] via-[#001845] to-[#002366] p-6 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm p-3 mb-4 border border-white/20">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="Mais Saúde"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <h2 className="text-white font-black text-2xl mb-2">
                Adicione à Tela Inicial
              </h2>
              <p className="text-white/70 text-sm">
                Acesse a farmácia com apenas 1 toque!
              </p>
            </div>
          </div>

          {/* Instruções passo a passo */}
          <div className="p-6 space-y-4">
            <p className="text-gray-500 text-sm text-center mb-2">
              Siga os 3 passos simples abaixo:
            </p>

            {/* Passo 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-lg">1</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-800 font-bold text-base mb-1">
                  Toque no botão Compartilhar
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>O ícone</span>
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Share size={16} className="text-blue-500" />
                  </div>
                  <span>na barra inferior do Safari</span>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-100">
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/30">
                <span className="text-white font-black text-lg">2</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-800 font-bold text-base mb-1">
                  Role e encontre a opção
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200">
                    <Plus size={14} className="text-gray-600" />
                    <span className="font-medium text-gray-700">Tela de Início</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100/50 border border-green-100">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                <span className="text-white font-black text-lg">3</span>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-800 font-bold text-base mb-1">
                  Toque em "Adicionar"
                </p>
                <p className="text-gray-500 text-sm">
                  No canto superior direito da tela
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={handleIOSInstalled}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-lg rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
            >
              <Check size={22} />
              Pronto, já adicionei!
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
            >
              Fazer isso depois
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}} />
      </div>
    );
  }

  // Banner para Android/Chrome
  if (deferredPrompt) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div 
          className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl"
          style={{ animation: 'scaleIn 0.3s ease-out' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#001233] via-[#001845] to-[#002366] p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm p-3 mb-4 border border-white/20">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="Mais Saúde"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              <h2 className="text-white font-black text-2xl mb-2">
                Instalar App
              </h2>
              <p className="text-white/70 text-sm">
                Acesse a farmácia direto da sua tela inicial!
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Instale o app da <strong>Farmácia Mais Saúde</strong> e tenha acesso rápido aos nossos produtos e promoções.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check size={16} className="text-green-500" />
                <span>Acesso rápido</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check size={16} className="text-green-500" />
                <span>Sem ocupar espaço</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Check size={16} className="text-green-500" />
                <span>Funciona offline</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleInstallAndroid}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-black text-lg rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-red-500/30"
            >
              Instalar Agora
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full py-3 text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}} />
      </div>
    );
  }

  // Banner genérico para outros navegadores
  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-[100]">
      <div 
        className="bg-gradient-to-r from-[#001233] to-[#001845] rounded-2xl shadow-2xl p-4 border border-white/10"
        style={{ animation: 'slideUp 0.4s ease-out' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 p-2">
            <div className="relative w-full h-full">
              <Image src="/logo.png" alt="Mais Saúde" fill className="object-contain" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">Adicionar à tela inicial</p>
            <p className="text-white/60 text-xs">Use o menu do navegador (⋮)</p>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />
    </div>
  );
};
