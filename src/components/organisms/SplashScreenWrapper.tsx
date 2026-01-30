'use client';

import React, { ReactNode } from 'react';
import { useLoading } from '@/context/LoadingContext';
import { SplashScreen } from './SplashScreen';

interface SplashScreenWrapperProps {
  children: ReactNode;
}

export const SplashScreenWrapper: React.FC<SplashScreenWrapperProps> = ({ children }) => {
  const { isLoading } = useLoading();

  return (
    <>
      <SplashScreen isLoading={isLoading} />
      <div
        className={`transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </>
  );
};
