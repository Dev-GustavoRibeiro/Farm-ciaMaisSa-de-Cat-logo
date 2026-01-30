import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Buscar depoimentos ativos (público)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Erro ao buscar depoimentos' }, { status: 500 });
  }
}

// POST - Criar novo depoimento (público)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, rating, comment } = body;

    // Validações
    if (!customer_name || customer_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome é obrigatório (mínimo 2 caracteres)' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5 estrelas' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'Comentário é obrigatório (mínimo 10 caracteres)' },
        { status: 400 }
      );
    }

    // Inserir com active = false (aguardando moderação)
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        customer_name: customer_name.trim(),
        rating,
        comment: comment.trim(),
        active: false, // Precisa de aprovação
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Obrigado pelo seu feedback! Seu depoimento será publicado após aprovação.',
      data,
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Erro ao enviar feedback' }, { status: 500 });
  }
}
