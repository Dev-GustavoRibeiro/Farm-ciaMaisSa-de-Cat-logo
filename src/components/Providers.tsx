'use client';

import React, { ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';
import { ProductModalProvider } from '@/context/ProductModalContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { SplashScreenWrapper } from './organisms/SplashScreenWrapper';
import { InstallPrompt } from './organisms/InstallPrompt';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <ToastProvider>
        <CustomerAuthProvider>
          <CartProvider>
            <ProductModalProvider>
              <SplashScreenWrapper>
                {children}
                <InstallPrompt />
              </SplashScreenWrapper>
            </ProductModalProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </ToastProvider>
    </LoadingProvider>
  );
};
