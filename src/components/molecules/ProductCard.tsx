'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Check, Eye, ShoppingCart, ImageOff } from 'lucide-react';
import { Product } from '@/types/database';
import { useCart } from '@/context/CartContext';
import { useProductModal } from '@/context/ProductModalContext';
import { Badge } from '@/components/atoms/Badge';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart, items } = useCart();
  const { openProductModal } = useProductModal();
  
  // Image handling with fallback
  const mainImage = product.images?.[0]?.url;
  
  const isInCart = items.some((item) => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleOpenModal = () => {
    openProductModal(product);
  };

  return (
    <div className="group relative flex h-full flex-col bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:border-red-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1">
      {/* Image Section */}
      <button onClick={handleOpenModal} className="relative block aspect-square overflow-hidden bg-gray-50 w-full group/image">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 bg-gray-50">
             <ImageOff size={48} strokeWidth={1.5} />
             <span className="text-xs font-medium mt-2">Sem imagem</span>
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <span className="flex items-center gap-2 px-6 py-2.5 bg-white rounded-full text-sm font-bold text-gray-900 shadow-xl hover:bg-gray-50 transition-colors">
            <Eye size={16} className="text-red-500" /> Ver Detalhes
          </span>
        </div>
        
        {!product.active && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
            <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 font-bold border border-gray-200">
              Indisponível
            </span>
          </div>
        )}

        {product.category && (
          <div className="absolute left-4 top-4 z-10">
             <Badge variant="secondary" className="bg-white/90 backdrop-blur text-blue-900 font-bold px-3 py-1 shadow-sm border border-white/50">
              {product.category.name}
            </Badge>
          </div>
        )}
      </button>
      
      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        <button onClick={handleOpenModal} className="mb-3 text-left">
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </button>
        
        <div className="mt-auto pt-4 flex items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Preço Unitário</span>
            <span className="text-2xl font-black text-blue-950 tracking-tight">
              {product.price
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)
                : 'Consulta'}
            </span>
          </div>
          
          <button 
            className={`
              relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 shadow-lg active:scale-90
              ${isInCart 
                ? 'bg-green-500 text-white shadow-green-500/30' 
                : 'bg-blue-900 text-white hover:bg-red-600 hover:shadow-red-600/30'}
            `}
            onClick={handleAddToCart}
            disabled={!product.active}
            title={isInCart ? "Adicionado" : "Adicionar ao carrinho"}
          >
            {isInCart ? (
              <Check size={22} className="stroke-[3px]" />
            ) : (
              <ShoppingCart size={22} className="stroke-[2.5px]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent);
