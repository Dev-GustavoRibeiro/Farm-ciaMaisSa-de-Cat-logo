import React from 'react';
import { CatalogTemplate } from '@/components/templates/CatalogTemplate';
import { supabase } from '@/lib/supabase';
import { Category, Product } from '@/types/database';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category_id?: string; q?: string }>;
}) {
  const { category_id, q } = await searchParams;

  // Fetch Categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('sort', { ascending: true });

  const categories = (categoriesData as Category[]) || [];

  // Fetch Products
  let productQuery = supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (category_id) {
    productQuery = productQuery.eq('category_id', category_id);
  }

  if (q) {
    productQuery = productQuery.ilike('name', `%${q}%`);
  }

  const { data: productsData } = await productQuery;
  const products = (productsData as Product[]) || [];

  return <CatalogTemplate categories={categories} products={products} />;
}
