'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag, Calendar, Eye } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface Customer {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  orders: CustomerOrder[];
}

interface CustomerOrder {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_phone.includes(searchTerm)
  );

  const columns = [
    {
      key: 'customer',
      header: 'Cliente',
      render: (customer: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {customer.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{customer.customer_name}</p>
            <p className="text-xs text-gray-500">{customer.customer_phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'orders',
      header: 'Pedidos',
      render: (customer: Customer) => (
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{customer.total_orders}</span>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total Gasto',
      render: (customer: Customer) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(customer.total_spent)}
        </span>
      ),
    },
    {
      key: 'lastOrder',
      header: 'Último Pedido',
      render: (customer: Customer) => (
        <span className="text-gray-600 text-sm">
          {formatDate(customer.last_order_date)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-16',
      render: (customer: Customer) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenModal(customer); }}
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
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-sm text-gray-500">Total de Clientes</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, c) => sum + c.total_orders, 0)}
              </p>
              <p className="text-sm text-gray-500">Total de Pedidos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <span className="font-bold text-lg">R$</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
              </p>
              <p className="text-sm text-gray-500">Receita Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredCustomers}
          isLoading={isLoading}
          emptyMessage="Nenhum cliente encontrado"
          emptyIcon={<Users className="w-12 h-12 opacity-20" />}
        />
      </div>

      {/* Modal de Detalhes do Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Detalhes do Cliente"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedCustomer.customer_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCustomer.customer_name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {selectedCustomer.customer_phone}
                  </span>
                  {selectedCustomer.customer_address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedCustomer.customer_address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats do Cliente */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedCustomer.total_orders}</p>
                <p className="text-sm text-blue-600/70">Pedidos</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCustomer.total_spent)}</p>
                <p className="text-sm text-green-600/70">Total Gasto</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(selectedCustomer.total_spent / selectedCustomer.total_orders || 0)}
                </p>
                <p className="text-sm text-purple-600/70">Ticket Médio</p>
              </div>
            </div>

            {/* Histórico de Pedidos */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Histórico de Pedidos</h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Pedido #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={order.status} />
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum pedido encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
