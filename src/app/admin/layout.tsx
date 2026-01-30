'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AuthProvider } from '@/context/AuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { ToastProvider } from '@/context/ToastContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Se for a página de login, renderiza sem proteção
  if (isLoginPage) {
    return (
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    );
  }

  // Todas as outras páginas admin são protegidas
  return (
    <ToastProvider>
      <AuthProvider>
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="md:ml-64 min-h-screen transition-all duration-300">
              <AdminHeader />
              <main className="p-4 md:p-8 pb-24 md:pb-8">
                {children}
              </main>
            </div>
          </div>
        </ProtectedRoute>
      </AuthProvider>
    </ToastProvider>
  );
}
