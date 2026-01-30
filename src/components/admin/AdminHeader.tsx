'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminHeader = () => {
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const { success, error } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsDropdownOpen(false);
    try {
      await signOut();
      success('Ate logo!', 'Voce saiu do sistema com sucesso.', 'user');
      router.push('/admin/login');
    } catch (err) {
      console.error('Erro ao sair:', err);
      error('Erro ao sair', 'Ocorreu um problema ao encerrar a sessao.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">
        <span className="md:hidden">Mais Saúde</span>
        <span className="hidden md:inline">Farmácia Mais Saúde - Admin</span>
      </h2>
      
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isLoading}
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {getUserInitial()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
              {user?.email || 'Admin'}
            </p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                      {getUserInitial()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-400">Administrador</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )}
                    <span className="text-sm font-medium">
                      {isSigningOut ? 'Saindo...' : 'Sair da conta'}
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
