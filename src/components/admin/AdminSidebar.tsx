'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Users, LayoutDashboard, ShoppingBag, Settings, FolderTree, MessageSquare, MoreHorizontal } from 'lucide-react';
import { clsx } from 'clsx';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminSidebar = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: ShoppingBag, label: 'Pedidos', href: '/admin/orders' },
    { icon: Package, label: 'Produtos', href: '/admin/products' },
    { icon: FolderTree, label: 'Categorias', href: '/admin/categories' },
    { icon: Users, label: 'Clientes', href: '/admin/customers' },
    { icon: MessageSquare, label: 'Depoimentos', href: '/admin/testimonials' },
    { icon: Settings, label: 'Configurações', href: '/admin/settings' },
  ];

  // Itens principais para a navbar mobile (máximo 4 + mais)
  const mobileMainItems = menuItems.slice(0, 4);
  const mobileMoreItems = menuItems.slice(4);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ========== DESKTOP SIDEBAR ========== */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-64 flex-col bg-gray-900 text-white shadow-xl">
        <div className="flex h-16 items-center px-6 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-white">Mais Saúde</span>
            <span className="text-red-500 ml-1">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ========== MOBILE BOTTOM NAVIGATION ========== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1 pb-safe">
          {mobileMainItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px]",
                isActive(item.href)
                  ? "text-blue-600"
                  : "text-gray-500"
              )}
            >
              <div className={clsx(
                "p-1.5 rounded-xl transition-all",
                isActive(item.href) && "bg-blue-100"
              )}>
                <item.icon size={22} strokeWidth={isActive(item.href) ? 2.5 : 2} />
              </div>
              <span className={clsx(
                "text-[10px] mt-0.5 font-medium",
                isActive(item.href) && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={clsx(
              "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px]",
              mobileMoreItems.some(item => isActive(item.href))
                ? "text-blue-600"
                : "text-gray-500"
            )}
          >
            <div className={clsx(
              "p-1.5 rounded-xl transition-all",
              mobileMoreItems.some(item => isActive(item.href)) && "bg-blue-100"
            )}>
              <MoreHorizontal size={22} strokeWidth={mobileMoreItems.some(item => isActive(item.href)) ? 2.5 : 2} />
            </div>
            <span className={clsx(
              "text-[10px] mt-0.5 font-medium",
              mobileMoreItems.some(item => isActive(item.href)) && "font-semibold"
            )}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* ========== MOBILE MORE MENU (Bottom Sheet) ========== */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Menu Items */}
              <div className="px-4 pb-4 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                  Mais opções
                </p>
                
                {mobileMoreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMoreMenu(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all",
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <item.icon size={22} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Safe area padding */}
              <div className="pb-safe" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
