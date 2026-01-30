'use client';

import React from 'react';
import { clsx } from 'clsx';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Pago', className: 'bg-green-100 text-green-700' },
  shipped: { label: 'Enviado', className: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregue', className: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
      config.className
    )}>
      {config.label}
    </span>
  );
};

export const ActiveBadge = ({ active }: { active: boolean }) => {
  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
      active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
    )}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
};
