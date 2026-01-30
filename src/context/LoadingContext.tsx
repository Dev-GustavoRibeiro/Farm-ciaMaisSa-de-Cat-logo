'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  registerLoader: (id: string) => void;
  markLoaded: (id: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingLoaders, setPendingLoaders] = useState<Set<string>>(new Set(['initial']));
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tempo mínimo de exibição da splash (1.5 segundos - reduzido)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Marca o loader inicial como carregado após o mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingLoaders(prev => {
        const next = new Set(prev);
        next.delete('initial');
        return next;
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // TIMEOUT DE SEGURANÇA: Se demorar mais de 5 segundos, força o carregamento
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      console.log('Loading timeout reached - forcing page load');
      setIsLoading(false);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Atualiza isLoading quando todos os loaders terminarem E o tempo mínimo passar
  useEffect(() => {
    if (pendingLoaders.size === 0 && minTimeElapsed) {
      // Limpa o timeout de segurança
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Pequeno delay para garantir transição suave
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pendingLoaders.size, minTimeElapsed]);

  const registerLoader = useCallback((id: string) => {
    // Não registra novos loaders se já passou do timeout
    setPendingLoaders(prev => {
      // Limita a 3 loaders para evitar bloqueio
      if (prev.size >= 3) return prev;
      return new Set(prev).add(id);
    });
  }, []);

  const markLoaded = useCallback((id: string) => {
    setPendingLoaders(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, registerLoader, markLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
