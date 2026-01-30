'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductImage } from '@/types/database';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState<string>(
    images?.[0]?.url || 'https://placehold.co/600x600?text=No+Image'
  );

  const hasImages = images && images.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={selectedImage}
              alt={productName}
              fill
              className="object-contain p-4"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {hasImages && images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {images.map((image) => (
            <button
              key={image.id}
              className={clsx(
                'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95',
                selectedImage === image.url 
                  ? 'border-blue-600 shadow-md ring-2 ring-blue-600/20' 
                  : 'border-transparent bg-gray-50 hover:border-gray-200'
              )}
              onClick={() => setSelectedImage(image.url)}
            >
              <Image
                src={image.url}
                alt={`${productName} thumbnail`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
