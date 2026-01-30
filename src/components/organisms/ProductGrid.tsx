'use client';

import React, { memo } from 'react';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/molecules/ProductCard';

interface ProductGridProps {
  products: Product[];
}

// Memoized ProductCard wrapper for performance
const MemoizedProductCard = memo(ProductCard);

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="rounded-full bg-gray-100 p-6 mb-4">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Nenhum produto encontrado</h3>
        <p className="mt-2 text-gray-500">Tente ajustar seus filtros ou busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
        >
          <MemoizedProductCard product={product} index={index} />
        </div>
      ))}
    </div>
  );
};
