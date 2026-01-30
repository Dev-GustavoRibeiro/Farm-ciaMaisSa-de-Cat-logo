import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Note: Para as configurações funcionarem completamente, você precisa criar uma tabela 'settings' no Supabase.
// Por enquanto, estamos usando localStorage no cliente como fallback.

export async function GET() {
  try {
    // Tentar buscar do Supabase primeiro
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      // Se a tabela não existir, retornar configurações padrão
      if (error.code === '42P01') { // table does not exist
        return NextResponse.json({});
      }
      throw error;
    }

    return NextResponse.json(data || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    // Retornar objeto vazio para usar configurações padrão
    return NextResponse.json({});
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    // Tentar atualizar/inserir no Supabase
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .single();

    let result;
    
    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from('settings')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Inserir
      const { data, error } = await supabase
        .from('settings')
        .insert([body])
        .select()
        .single();
      
      if (error) {
        // Se a tabela não existir, ainda assim retornar sucesso
        // As configurações serão persistidas no localStorage do cliente
        if (error.code === '42P01') {
          return NextResponse.json(body);
        }
        throw error;
      }
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    // Ainda assim retornar sucesso para o cliente poder usar localStorage
    return NextResponse.json({ success: true });
  }
}
