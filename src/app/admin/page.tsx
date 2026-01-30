import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Package, DollarSign, ShoppingBag, TrendingUp, Users, ArrowRight } from 'lucide-react';

export const revalidate = 0;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Pago', className: 'bg-green-100 text-green-700' },
  shipped: { label: 'Enviado', className: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregue', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

export default async function AdminDashboard() {
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: allOrders } = await supabase
    .from('orders')
    .select('total_amount, customer_phone');

  // Calcular estatísticas
  const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const ordersCount = allOrders?.length || 0;
  const uniqueCustomers = new Set(allOrders?.map(o => o.customer_phone)).size;
    
  const stats = [
    { title: 'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Pedidos', value: ordersCount, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Produtos', value: productsCount || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Clientes', value: uniqueCustomers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Últimos Pedidos</h3>
            <Link 
              href="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {order.customer_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusConfig[order.status]?.className || statusConfig.pending.className}`}>
                      {statusConfig[order.status]?.label || 'Pendente'}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center justify-center h-64 text-gray-400">
              <ShoppingBag size={48} className="opacity-20" />
              <p>Nenhum pedido recente</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ações Rápidas</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/products"
              className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <Package className="w-8 h-8 text-blue-600 mb-2" />
              <p className="font-semibold text-gray-900">Novo Produto</p>
              <p className="text-xs text-gray-500">Adicionar ao catálogo</p>
            </Link>
            
            <Link
              href="/admin/categories"
              className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
              <p className="font-semibold text-gray-900">Categorias</p>
              <p className="text-xs text-gray-500">Gerenciar categorias</p>
            </Link>
            
            <Link
              href="/admin/orders"
              className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <ShoppingBag className="w-8 h-8 text-green-600 mb-2" />
              <p className="font-semibold text-gray-900">Pedidos</p>
              <p className="text-xs text-gray-500">Ver todos os pedidos</p>
            </Link>
            
            <Link
              href="/admin/settings"
              className="p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
            >
              <Users className="w-8 h-8 text-orange-600 mb-2" />
              <p className="font-semibold text-gray-900">Configurações</p>
              <p className="text-xs text-gray-500">Ajustar sua loja</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
