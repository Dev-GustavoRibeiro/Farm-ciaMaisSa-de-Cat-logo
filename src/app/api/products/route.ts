import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper to get authenticated client
const getAuthenticatedSupabase = (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get('category_id');
  const searchQuery = searchParams.get('q');
  const activeOnly = searchParams.get('active_only') !== 'false'; // Default to true

  let query = supabase
    .from('products')
    .select('*, category:categories(*), images:product_images(*)')
    .order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('active', true);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  // Search by name or description
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabaseAuth = getAuthenticatedSupabase(request);
  if (!supabaseAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { data, error } = await supabaseAuth
    .from('products')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
