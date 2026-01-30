'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingCart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductModal } from '@/context/ProductModalContext';
import { useCart } from '@/context/CartContext';
import { links } from '@/config/links.config';
import { Badge } from '@/components/atoms/Badge';

export const ProductModal = () => {
  const { selectedProduct, isOpen, closeProductModal } = useProductModal();
  const { addToCart, items, updateQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = selectedProduct;
  const cartItem = items.find(item => item.id === product?.id);
  const isInCart = !!cartItem;

  const images = product?.images?.length ? product.images : [{ url: 'https://placehold.co/600x600?text=Sem+Imagem', id: 'placeholder', product_id: '', sort: 0 }];

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setQuantity(1);
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const message = product.whatsapp_message || `Olá! Gostaria de comprar: ${product.name}`;
    const url = `https://wa.me/${links.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Sob consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProductModal}
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[9999] md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={closeProductModal}
              className="absolute right-4 top-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Image Section */}
              <div className="relative w-full md:w-1/2 bg-gray-100 flex-shrink-0">
                <div className="relative aspect-square">
                  <Image
                    src={images[currentImageIndex]?.url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Category Badge */}
                  {product.category && (
                    <div className="absolute left-4 top-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 font-bold shadow-sm">
                        {product.category.name}
                      </Badge>
                    </div>
                  )}

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>

                      {/* Dots */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? 'bg-red-600' : 'bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="hidden md:flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={img.id || idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                          idx === currentImageIndex ? 'border-red-600' : 'border-transparent'
                        }`}
                      >
                        <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 flex flex-col p-6 overflow-y-auto scrollbar-hide">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-black text-red-600">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {product.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Descrição
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Quantidade
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="w-12 text-center font-bold">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-3 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      {isInCart && (
                        <span className="text-sm text-green-600 font-medium">
                          {cartItem.quantity} no carrinho
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.active}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    Adicionar ao Carrinho
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors"
                  >
                    <MessageCircle size={20} />
                    Pedir pelo WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
