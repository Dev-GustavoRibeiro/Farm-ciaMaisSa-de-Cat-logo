'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/database';

interface ProductModalContextType {
  selectedProduct: Product | null;
  isOpen: boolean;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export const ProductModalProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeProductModal = () => {
    setIsOpen(false);
    // Delay clearing product to allow animation
    setTimeout(() => setSelectedProduct(null), 300);
  };

  return (
    <ProductModalContext.Provider
      value={{
        selectedProduct,
        isOpen,
        openProductModal,
        closeProductModal,
      }}
    >
      {children}
    </ProductModalContext.Provider>
  );
};

export const useProductModal = () => {
  const context = useContext(ProductModalContext);
  if (context === undefined) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
};
