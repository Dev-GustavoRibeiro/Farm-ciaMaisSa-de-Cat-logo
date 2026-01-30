'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Star, Check, X, Trash2, Clock, CheckCircle } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Testimonial } from '@/types/database';
import { useAdminToast } from '@/hooks/useAdminToast';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const toast = useAdminToast();

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleToggleActive = async (testimonial: Testimonial) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !testimonial.active }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      await fetchTestimonials();
      
      if (!testimonial.active) {
        toast.testimonialApproved();
      } else {
        toast.testimonialRejected();
      }
    } catch (error) {
      console.error('Erro ao atualizar depoimento:', error);
      toast.operationFailed('Erro ao atualizar depoimento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTestimonial) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/testimonials/${selectedTestimonial.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir');

      await fetchTestimonials();
      setIsDeleteDialogOpen(false);
      toast.itemDeleted('Depoimento');
      setSelectedTestimonial(null);
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error);
      toast.operationFailed('Erro ao excluir depoimento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsDeleteDialogOpen(true);
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

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.active;
    if (filter === 'approved') return t.active;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.active).length;
  const approvedCount = testimonials.filter(t => t.active).length;

  const columns = [
    {
      key: 'customer',
      header: 'Cliente',
      render: (item: Testimonial) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
            {item.customer_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.customer_name}</p>
            <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Avaliação',
      render: (item: Testimonial) => (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Comentário',
      render: (item: Testimonial) => (
        <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
          {item.comment}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Testimonial) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
          item.active 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {item.active ? (
            <>
              <CheckCircle size={12} />
              Aprovado
            </>
          ) : (
            <>
              <Clock size={12} />
              Pendente
            </>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-32',
      render: (item: Testimonial) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleToggleActive(item); }}
            disabled={isSaving}
            className={`p-2 rounded-lg transition-colors ${
              item.active
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={item.active ? 'Desaprovar' : 'Aprovar'}
          >
            {item.active ? <X size={16} /> : <Check size={16} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteDialog(item); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Depoimentos</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
              <p className="text-sm text-gray-500">Total de Depoimentos</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-500">Aguardando Aprovação</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-sm text-gray-500">Aprovados</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({testimonials.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            Aprovados ({approvedCount})
          </button>
        </div>

        <DataTable
          columns={columns}
          data={filteredTestimonials}
          isLoading={isLoading}
          emptyMessage="Nenhum depoimento encontrado"
          emptyIcon={<MessageSquare className="w-12 h-12 opacity-20" />}
        />
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Depoimento"
        message={`Tem certeza que deseja excluir o depoimento de "${selectedTestimonial?.customer_name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isSaving}
      />
    </div>
  );
}
