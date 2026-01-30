import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface OrderRow {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
}

interface Customer {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  orders: {
    id: string;
    created_at: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  }[];
}

export async function GET() {
  try {
    // Buscar todos os pedidos
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agrupar por cliente (usando telefone como identificador único)
    const customersMap = new Map<string, Customer>();

    (orders as OrderRow[])?.forEach((order) => {
      const key = order.customer_phone;
      
      if (!customersMap.has(key)) {
        customersMap.set(key, {
          id: key, // Usando telefone como ID único
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          total_orders: 0,
          total_spent: 0,
          last_order_date: order.created_at,
          orders: [],
        });
      }

      const customer = customersMap.get(key)!;
      customer.total_orders += 1;
      customer.total_spent += order.total_amount;
      customer.orders.push({
        id: order.id,
        created_at: order.created_at,
        total_amount: order.total_amount,
        status: order.status,
      });

      // Atualizar último pedido se for mais recente
      if (new Date(order.created_at) > new Date(customer.last_order_date)) {
        customer.last_order_date = order.created_at;
        customer.customer_name = order.customer_name; // Usar nome mais recente
        customer.customer_address = order.customer_address;
      }
    });

    const customers = Array.from(customersMap.values())
      .sort((a, b) => b.total_spent - a.total_spent);

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}
