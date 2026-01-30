'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Eye, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SelectField } from '@/components/admin/FormField';
import { Order, OrderItem } from '@/types/database';
import { useAdminToast } from '@/hooks/useAdminToast';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const toast = useAdminToast();

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenModal = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`);
      const data = await response.json();
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    setIsSaving(true);

    const orderNumber = selectedOrder.id.slice(0, 8);

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar status');

      setSelectedOrder(prev => prev ? { ...prev, status } : null);
      await fetchOrders();

      // Notificações específicas por status
      switch (status) {
        case 'paid':
          toast.orderConfirmed(orderNumber);
          break;
        case 'shipped':
          toast.orderSent(orderNumber);
          break;
        case 'delivered':
          toast.orderDelivered(orderNumber);
          break;
        case 'cancelled':
          toast.orderCancelled(orderNumber);
          break;
        default:
          toast.statusChanged(statusOptions.find(s => s.value === status)?.label || status);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.operationFailed('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'id',
      header: 'Pedido',
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-600">
          #{order.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (order: Order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customer_name}</p>
          <p className="text-xs text-gray-500">{order.customer_phone}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Data',
      render: (order: Order) => (
        <span className="text-gray-600 text-sm">{formatDate(order.created_at)}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-semibold text-gray-900">{formatCurrency(order.total_amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (order: Order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (order: Order) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Todos os status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          emptyMessage="Nenhum pedido encontrado"
          emptyIcon={<ShoppingBag className="w-12 h-12 opacity-20" />}
        />
      </div>

      {/* Modal de Detalhes do Pedido */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Pedido #${selectedOrder?.id.slice(0, 8) || ''}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder.status} />
                <span className="text-sm text-gray-500">
                  {formatDate(selectedOrder.created_at)}
                </span>
              </div>
              <div className="w-48">
                <SelectField
                  label=""
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  options={statusOptions}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-100 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Cliente</h4>
                <div className="space-y-2">
                  <p className="text-gray-700">{selectedOrder.customer_name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    {selectedOrder.customer_phone}
                  </div>
                  {selectedOrder.customer_address && (
                    <div className="flex items-start gap-2 text-sm text-gray-500">
                      <MapPin size={14} className="mt-0.5" />
                      {selectedOrder.customer_address}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border border-gray-100 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3">Pagamento</h4>
                <div className="space-y-2">
                  <p className="text-gray-700 capitalize">{selectedOrder.payment_method}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={14} />
                    {formatDate(selectedOrder.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item: OrderItem) => (
                      <div key={item.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product?.name || 'Produto removido'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity}x {formatCurrency(item.price_at_purchase)}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.quantity * item.price_at_purchase)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item no pedido</p>
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-xl">
              <span className="font-medium">Total do Pedido</span>
              <span className="text-2xl font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
