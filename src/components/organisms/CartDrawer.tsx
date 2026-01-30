'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/atoms/Button';
import { X, Plus, Minus, MessageCircle, Trash2, ShoppingBag, User, Package } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutModal } from '@/components/organisms/CheckoutModal';
import { CustomerAuthModal } from '@/components/organisms/CustomerAuthModal';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export const CartDrawer = () => {
  const { items, isOpen, toggleCart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const { isAuthenticated, profile, signOut } = useCustomerAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleWhatsAppCheckout = () => {
    setShowCheckout(true);
  };

  const handleOpenAuth = () => {
    setShowCheckout(false);
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setShowCheckout(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <>
      {/* Auth Modal */}
      <CustomerAuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)}
        onOpenAuth={handleOpenAuth}
      />
      
      <AnimatePresence>
      {isOpen && !showCheckout && !showAuth && (
        <React.Fragment key="cart-modal">
          {/* Backdrop */}
          <motion.div 
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm" 
            onClick={toggleCart}
          />
          
          {/* Modal - Centralizado em desktop, fullscreen em mobile */}
          <motion.div 
            key="cart-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[9999] flex flex-col bg-white rounded-3xl shadow-2xl sm:w-full sm:max-w-lg sm:max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-950 to-blue-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ShoppingBag className="text-white" size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Seu Carrinho</h2>
                  <p className="text-xs text-white/60">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
                </div>
              </div>
              <button 
                onClick={toggleCart} 
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center p-6">
                  <div className="mb-6 w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Carrinho vazio</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs">
                    Adicione produtos para começar seu pedido na Farmácia Mais Saúde.
                  </p>
                  <Button variant="primary" onClick={toggleCart}>
                    Ver Produtos
                  </Button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-4">
                  {items.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id} 
                      className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden rounded-xl bg-white border border-gray-100">
                        <Image
                          src={item.images?.[0]?.url || 'https://placehold.co/100x100?text=Produto'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-tight">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-red-600 font-bold text-base sm:text-lg">
                            {formatPrice(item.price || 0)}
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity */}
                          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
                            <button 
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button 
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          {/* Remove */}
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-6 space-y-4">
                {/* User Status */}
                {isAuthenticated ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{profile?.name || 'Usuário'}</p>
                        <p className="text-xs text-green-600">Dados salvos</p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => await signOut()}
                      className="text-xs text-green-600 hover:text-green-800 font-medium"
                    >
                      Sair
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center gap-2 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">Entrar para salvar dados</span>
                  </button>
                )}

                {/* Total */}
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-2xl font-black text-gray-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Checkout Button */}
                <Button 
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-600/30"
                  size="lg"
                  onClick={handleWhatsAppCheckout}
                >
                  <MessageCircle size={22} />
                  Finalizar no WhatsApp
                </Button>
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
      </AnimatePresence>
    </>
  );
};
