'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Heart, CheckCircle } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const { signIn, signUp } = useCustomerAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!email.trim()) {
      setError('Digite seu e-mail');
      return;
    }

    if (!password) {
      setError('Digite sua senha');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Digite seu nome');
        return;
      }
      if (!phone.trim()) {
        setError('Digite seu telefone');
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    setIsLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError('E-mail ou senha incorretos');
        setIsLoading(false);
        return;
      }
    } else {
      const { error } = await signUp(email, password, name, phone);
      if (error) {
        if (error.includes('already registered') || error.includes('User already registered')) {
          setError('Este e-mail já está cadastrado. Faça login.');
          setMode('login');
        } else if (error.includes('Invalid email')) {
          setError('E-mail inválido');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
        setIsLoading(false);
        return;
      }
      setSuccess('Conta criada com sucesso! Você já está logado.');
    }

    setIsLoading(false);
    
    if (onSuccess) {
      setTimeout(() => {
        onSuccess();
        resetForm();
      }, 800);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mx-4">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 py-6 text-center relative">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm mb-3">
                  <Heart className="w-7 h-7 text-red-400" fill="currentColor" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {mode === 'login' ? 'Entrar na sua conta' : 'Criar sua conta'}
                </h2>
                <p className="text-blue-200 text-sm mt-1">
                  {mode === 'login' 
                    ? 'Acesse para finalizar sua compra' 
                    : 'Cadastre-se e salve seus dados'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600"
                  >
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">{success}</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600"
                  >
                    <X size={20} />
                    <span className="text-sm font-medium">{error}</span>
                  </motion.div>
                )}

                {/* Name Field (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        placeholder="Seu nome"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Phone Field (signup only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        placeholder="(00) 00000-0000"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="seu@email.com"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                      disabled={isLoading}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                    </>
                  ) : (
                    mode === 'login' ? 'Entrar' : 'Criar conta'
                  )}
                </button>

                {/* Switch Mode */}
                <p className="text-center text-sm text-gray-500">
                  {mode === 'login' ? (
                    <>
                      Não tem conta?{' '}
                      <button
                        type="button"
                        onClick={switchMode}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Cadastre-se
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem conta?{' '}
                      <button
                        type="button"
                        onClick={switchMode}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Fazer login
                      </button>
                    </>
                  )}
                </p>

                {/* Continue as Guest */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    Continuar sem conta
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
