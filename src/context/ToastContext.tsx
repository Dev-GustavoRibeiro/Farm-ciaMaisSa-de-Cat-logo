'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  ShoppingCart,
  Heart,
  Bell,
  Mail,
  Save,
  Trash2,
  User,
  Package,
  CreditCard
} from 'lucide-react';

// Tipos de toast
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Ícones especiais para contextos específicos
export type ToastIcon = 
  | 'default'
  | 'cart' 
  | 'heart' 
  | 'bell' 
  | 'mail' 
  | 'save' 
  | 'trash' 
  | 'user' 
  | 'package'
  | 'payment';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: ToastIcon;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  // Atalhos convenientes
  success: (title: string, message?: string, icon?: ToastIcon) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string, icon?: ToastIcon) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Componente do Toast individual
const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const specialIcons = {
    cart: ShoppingCart,
    heart: Heart,
    bell: Bell,
    mail: Mail,
    save: Save,
    trash: Trash2,
    user: User,
    package: Package,
    payment: CreditCard,
  };

  const colors = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      iconBg: 'bg-white/20',
      text: 'text-white',
      subtext: 'text-green-100',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      iconBg: 'bg-white/20',
      text: 'text-white',
      subtext: 'text-red-100',
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      iconBg: 'bg-white/20',
      text: 'text-white',
      subtext: 'text-amber-100',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20',
      text: 'text-white',
      subtext: 'text-blue-100',
    },
  };

  const Icon = toast.icon && toast.icon !== 'default' 
    ? specialIcons[toast.icon] 
    : icons[toast.type];
  
  const color = colors[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${color.bg} rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-[420px]`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Ícone */}
        <div className={`${color.iconBg} p-2.5 rounded-xl flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color.text}`} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`font-semibold ${color.text} text-sm`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className={`${color.subtext} text-xs mt-0.5 line-clamp-2`}>
              {toast.message}
            </p>
          )}
        </div>

        {/* Botão fechar */}
        <button
          onClick={onRemove}
          className={`${color.iconBg} hover:bg-white/30 p-1.5 rounded-lg transition-colors flex-shrink-0`}
        >
          <X className={`w-4 h-4 ${color.text}`} />
        </button>
      </div>

      {/* Barra de progresso */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
        className="h-1 bg-white/30"
      />
    </motion.div>
  );
};

// Provider
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 4000;

    setToasts((prev) => [...prev, { ...toast, id, duration }]);

    // Auto-remove após duração
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Atalhos
  const success = useCallback((title: string, message?: string, icon?: ToastIcon) => {
    addToast({ type: 'success', title, message, icon });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 5000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, icon?: ToastIcon) => {
    addToast({ type: 'info', title, message, icon });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Container dos Toasts */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
