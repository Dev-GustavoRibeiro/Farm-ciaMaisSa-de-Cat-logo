'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, WifiOff, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, hasError, errorMessage, retryAuth } = useAuth();
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasError) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, hasError, router]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await retryAuth();
    setIsRetrying(false);
  }, [retryAuth]);

  const handleGoToLogin = () => {
    router.replace('/admin/login');
  };

  // Estado de erro de conexão
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Problema de Conexao</h2>
          <p className="text-gray-500 mb-6">
            {errorMessage || 'Nao foi possivel verificar sua sessao. Verifique sua conexao com a internet.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Reconectando...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  Tentar novamente
                </>
              )}
            </button>
            <button
              onClick={handleGoToLogin}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Ir para login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Verificando sessao...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
