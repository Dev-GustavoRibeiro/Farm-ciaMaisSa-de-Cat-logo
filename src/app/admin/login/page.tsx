'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Shield, RefreshCw, CheckCircle, WifiOff, LogIn } from 'lucide-react';
import { useAuth, AuthEvent } from '@/context/AuthContext';

// Componente de Toast para notificações
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: LogIn,
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
    >
      <Icon size={20} />
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const { 
    signIn, 
    isAuthenticated, 
    isLoading: authLoading, 
    hasError, 
    errorMessage, 
    retryAuth,
    setOnAuthEvent 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  // Configurar callback de eventos de autenticação
  useEffect(() => {
    setOnAuthEvent((event: AuthEvent, message: string) => {
      switch (event) {
        case 'login_success':
          setToast({ message, type: 'success' });
          break;
        case 'login_error':
          setToast({ message, type: 'error' });
          break;
        case 'logout':
          setToast({ message, type: 'info' });
          break;
        case 'session_expired':
          setToast({ message, type: 'warning' });
          break;
        case 'timeout_error':
          setToast({ message, type: 'error' });
          break;
      }
    });
  }, [setOnAuthEvent]);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setError('');
    await retryAuth();
    setIsRetrying(false);
  }, [retryAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Digite seu e-mail');
      return;
    }

    if (!password) {
      setError('Digite sua senha');
      return;
    }

    setIsLoading(true);

    const { error: signInError, success } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }

    if (success) {
      // Login bem sucedido - o useEffect vai redirecionar
      router.replace('/admin');
    }
    
    setIsLoading(false);
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading && !hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
          <p className="mt-4 text-white/80">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  // Se já está autenticado, mostrar loading enquanto redireciona
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950">
        <div className="text-center text-white">
          <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
          <p className="mt-4 font-medium">Login realizado com sucesso!</p>
          <p className="text-white/60 text-sm mt-1">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-950 p-4">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50">
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-red-500/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-white">Farmacia Mais Saude</h1>
            <p className="text-blue-200 text-sm mt-1">Painel Administrativo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-full py-2 px-4">
              <Shield size={14} className="text-green-500" />
              <span>Conexao segura</span>
            </div>

            {/* Connection Error with Retry */}
            {hasError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">
                      {errorMessage || 'Problema de conexao'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Verifique sua internet e tente novamente.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="mt-3 w-full py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      Tentar novamente
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Error Message */}
            {error && !hasError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600"
              >
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="seu@email.com"
                  disabled={isLoading || isRetrying}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder="••••••••"
                  disabled={isLoading || isRetrying}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isRetrying}
              className="w-full py-4 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-300/60 text-xs mt-6">
          © 2026 Farmacia Mais Saude - Ipira, BA
        </p>
      </motion.div>
    </div>
  );
}
