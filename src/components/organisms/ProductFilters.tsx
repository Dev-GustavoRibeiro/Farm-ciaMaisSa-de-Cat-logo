'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types/database';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface ProductFiltersProps {
  categories: Category[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ categories }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category_id');

  const handleCategoryChange = (categoryId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) {
      params.set('category_id', categoryId);
    } else {
      params.delete('category_id');
    }
    // Using { scroll: false } prevents page reload/scroll reset
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-center">
      <div className="scrollbar-hide inline-flex flex-wrap justify-center gap-2 md:gap-3 py-2 px-4 md:px-0">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleCategoryChange(null)}
          className={clsx(
            'rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200',
            currentCategory === null
              ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/25'
              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
          )}
        >
          Todos
        </motion.button>
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCategoryChange(category.id)}
            className={clsx(
              'rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200',
              currentCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
            )}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
