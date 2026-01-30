import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Erro ao buscar produto' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { images, ...productData } = body;

    // Atualizar produto
    const { error: productError } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id);

    if (productError) throw productError;

    // Atualizar imagens (deletar todas e recriar)
    if (images !== undefined) {
      // Deletar imagens existentes
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Criar novas imagens
      if (images.length > 0) {
        const imageRecords = images.map((url: string, index: number) => ({
          product_id: id,
          url,
          sort: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }
    }

    // Buscar produto atualizado
    const { data: fullProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        images:product_images(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json(fullProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // As imagens serão deletadas automaticamente pelo ON DELETE CASCADE
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
