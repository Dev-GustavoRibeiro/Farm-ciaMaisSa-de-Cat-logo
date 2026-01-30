'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, User, Search, X } from 'lucide-react';
import { Category, Product } from '@/types/database';
import { ProductGrid } from '@/components/organisms/ProductGrid';
import { ProductFilters } from '@/components/organisms/ProductFilters';
import { SearchBar } from '@/components/molecules/SearchBar';
import { CartDrawer } from '@/components/organisms/CartDrawer';
import { ProductModal } from '@/components/organisms/ProductModal';
import { CustomerAuthModal } from '@/components/organisms/CustomerAuthModal';
import { CustomerProfileModal } from '@/components/organisms/CustomerProfileModal';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Hero } from '@/components/organisms/Hero';
import { Footer } from '@/components/organisms/Footer';
import { Marquee } from '@/components/molecules/Marquee';
import { BenefitsSection } from '@/components/organisms/BenefitsSection';
import { MobileNav } from '@/components/organisms/MobileNav';

interface CatalogTemplateProps {
  categories: Category[];
  products: Product[];
}

export const CatalogTemplate: React.FC<CatalogTemplateProps> = ({ categories, products }) => {
  const { toggleCart, totalItems } = useCart();
  const { isAuthenticated, profile, isLoading } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-red-500/30">
      <Marquee />
      
      {/* Auth Modal */}
      <CustomerAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* Profile Modal */}
      <CustomerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-[100] w-full border-b border-gray-100 bg-white/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            
            {/* Desktop: Logo on Left / Mobile: Spacer or Center Logo Context */}
            {/* ORDER: 1 */}
            <div className="flex-none lg:flex-1 flex items-center justify-start">
               {/* Logo: Centered on Mobile (Absolute) / Left on Desktop (Static) */}
               <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mr-8 z-10">
                  <button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="relative block h-14 w-14 lg:h-16 lg:w-auto lg:aspect-[3/1] transition-transform hover:scale-105 cursor-pointer"
                  >
                    <Image 
                      src="/logo.png" 
                      alt="Farmácia Mais Saúde" 
                      fill 
                      className="object-contain lg:object-left"
                      priority
                    />
                  </button>
               </div>
            </div>

            {/* Desktop: Search in Center / Mobile: Hidden */}
            {/* ORDER: 2 */}
            <div className="hidden lg:flex flex-1 items-center justify-center max-w-lg relative z-[200]">
               <SearchBar />
            </div>

            {/* Desktop: Actions on Right / Mobile: Hidden */}
            {/* ORDER: 3 */}
            <div className="flex-1 flex items-center justify-end gap-3">
              {/* Desktop Actions Container */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Desktop Login/Profile */}
                {!isLoading && (
                  isAuthenticated ? (
                    <button 
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center gap-2 px-1 py-1 pr-3 rounded-full border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-bold text-gray-700 max-w-[80px] truncate">
                        {profile?.name?.split(' ')[0]}
                      </span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20"
                    >
                      <User size={18} />
                      <span>Entrar</span>
                    </button>
                  )
                )}

                {/* Cart Button */}
                <button 
                  onClick={toggleCart}
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all"
                >
                  <ShoppingCart size={20} className="transition-transform group-hover:scale-110" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile Search Overlay */}
          {showMobileSearch && (
            <div className="lg:hidden animate-fade-in relative z-[200]">
              <div className="pb-4 pt-2">
                <SearchBar />
              </div>
            </div>
          )}
        </div>
      </header>

      <Hero />
      
      <BenefitsSection />

      <main className="container mx-auto px-4 py-5" id="products-section">
        {/* Section Header */}
        <div className="mb-16 text-center space-y-4">
          <div className="inline-block">
            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-900 font-bold text-xs uppercase tracking-widest border border-blue-100">
              Catálogo Completo
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-blue-950">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Produtos</span>
          </h2>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
            Qualidade, preço baixo e a confiança que você já conhece.
          </p>

          <div className="mt-10">
            <ProductFilters categories={categories} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[400px]">
          <ProductGrid products={products} />
        </div>
      </main>

      <Footer categories={categories} />
      <CartDrawer />
      <ProductModal />
      
      <MobileNav 
        onSearchClick={() => setShowMobileSearch(!showMobileSearch)}
        onProfileClick={() => isAuthenticated ? setShowProfileModal(true) : setShowAuthModal(true)}
      />
    </div>
  );
};
