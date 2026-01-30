import React from 'react';
import { ProductTemplate } from '@/components/templates/ProductTemplate';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import { notFound } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: productData } = await supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('slug', slug)
    .single();

  if (!productData) {
    notFound();
  }

  const product = productData as Product;

  return (
    <CartProvider>
      <ProductTemplate product={product} />
    </CartProvider>
  );
}
