'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Share2, Star, Truck, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/database';
import { ProductGallery } from '@/components/organisms/ProductGallery';
import { WhatsAppCTA } from '@/components/organisms/WhatsAppCTA';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { CartDrawer } from '@/components/organisms/CartDrawer';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';

import { MobileNav } from '@/components/organisms/MobileNav';

interface ProductTemplateProps {
  product: Product;
}

export const ProductTemplate: React.FC<ProductTemplateProps> = ({ product }) => {
  const { addToCart, toggleCart, totalItems } = useCart();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira ${product.name} no nosso catálogo!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 pl-0 text-gray-600 hover:bg-transparent hover:text-gray-900">
              <ChevronLeft size={20} />
              <span className="font-semibold">Voltar</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-600 hover:text-gray-900">
              <Share2 size={20} />
            </Button>
            <button 
              onClick={toggleCart}
              className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <ProductGallery
              images={product.images || []}
              productName={product.name}
            />
          </motion.div>

          {/* Details Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-8 border-b border-gray-100 pb-8">
              <div className="mb-4 flex items-center gap-2">
                {product.category && (
                  <Badge variant="secondary" className="bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {product.category.name}
                  </Badge>
                )}
                <div className="flex items-center text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <span className="ml-2 text-sm font-medium text-gray-500">(Novo)</span>
                </div>
              </div>
              
              <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black text-gray-900 md:text-5xl">
                  {product.price
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(product.price)
                    : 'Sob Consulta'}
                </span>
                {product.active ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Disponível
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                    Esgotado
                  </span>
                )}
              </div>
            </div>

            <div className="mb-8 space-y-6 text-gray-600">
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 shadow-sm text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Entrega Rápida</h4>
                    <p className="text-sm text-gray-500">Enviamos para todo Brasil.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="rounded-full bg-white p-2 shadow-sm text-blue-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Compra Segura</h4>
                    <p className="text-sm text-gray-500">Negociação direta e segura.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="h-14 flex-1 text-lg font-bold shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 hover:shadow-2xl bg-blue-600 hover:bg-blue-700"
                onClick={() => addToCart(product)}
                disabled={!product.active}
              >
                Adicionar ao Carrinho
              </Button>
              <div className="flex-1">
                <WhatsAppCTA
                  productName={product.name}
                  message={product.whatsapp_message || undefined}
                  variant="block"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <CartDrawer />
      <MobileNav />
    </div>
  );
};
