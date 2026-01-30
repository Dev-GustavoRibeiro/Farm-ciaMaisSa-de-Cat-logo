'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { clsx } from 'clsx';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface MobileNavProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onSearchClick, onProfileClick }) => {
  const pathname = usePathname();
  const { toggleCart, totalItems } = useCart();
  const { isAuthenticated, profile } = useCustomerAuth();

  const navItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Buscar', action: onSearchClick },
    { icon: ShoppingBag, label: 'Carrinho', action: toggleCart, isCart: true },
    { 
      icon: User, 
      label: isAuthenticated ? (profile?.name?.split(' ')[0] || 'Perfil') : 'Entrar', 
      action: onProfileClick 
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
      <div className="flex items-center justify-around bg-[#002366]/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/40 border border-white/10 p-3">
        {navItems.map((item, index) => {
          const isActive = item.href === pathname;
          const Icon = item.icon;

          if (item.action) {
            return (
              <button
                key={index}
                onClick={item.action}
                className="relative flex flex-col items-center justify-center gap-1 p-2 text-blue-200 transition-all active:scale-90 active:text-white"
              >
                <div className="relative">
                  <Icon size={22} className={clsx(item.isCart && totalItems > 0 && "text-white")} />
                  {item.isCart && totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-sm ring-2 ring-[#002366] animate-fade-in">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href || '#'}
              className={clsx(
                'flex flex-col items-center justify-center gap-1 p-2 transition-all active:scale-90',
                isActive ? 'text-white' : 'text-blue-200'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
