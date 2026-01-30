'use client';

import { useToast } from '@/context/ToastContext';

/**
 * Hook utilitário para notificações administrativas comuns
 */
export const useAdminToast = () => {
  const { success, error, warning, info } = useToast();

  return {
    // Notificações de CRUD
    itemCreated: (itemName: string) => 
      success('Criado com sucesso!', `${itemName} foi adicionado`, 'package'),
    
    itemUpdated: (itemName: string) => 
      success('Atualizado!', `${itemName} foi atualizado`, 'save'),
    
    itemDeleted: (itemName: string) => 
      success('Removido!', `${itemName} foi excluído`, 'trash'),
    
    // Notificações de Status
    statusChanged: (status: string) => 
      success('Status alterado!', `Status atualizado para "${status}"`, 'package'),
    
    // Notificações de Pedidos
    orderConfirmed: (orderNumber: string) => 
      success('Pedido confirmado!', `Pedido #${orderNumber} foi confirmado`, 'package'),
    
    orderSent: (orderNumber: string) => 
      success('Pedido enviado!', `Pedido #${orderNumber} foi despachado`, 'package'),
    
    orderDelivered: (orderNumber: string) => 
      success('Pedido entregue!', `Pedido #${orderNumber} foi entregue`, 'package'),
    
    orderCancelled: (orderNumber: string) => 
      warning('Pedido cancelado', `Pedido #${orderNumber} foi cancelado`),
    
    // Notificações de Configurações
    settingsSaved: () => 
      success('Configurações salvas!', 'Suas alterações foram aplicadas', 'save'),
    
    // Notificações de Depoimentos
    testimonialApproved: () => 
      success('Depoimento aprovado!', 'O depoimento está visível no site', 'heart'),
    
    testimonialRejected: () => 
      info('Depoimento rejeitado', 'O depoimento foi marcado como pendente', 'heart'),
    
    // Notificações de Erro
    operationFailed: (message?: string) => 
      error('Erro na operação', message || 'Algo deu errado. Tente novamente.'),
    
    validationError: (message: string) => 
      warning('Atenção', message),
    
    // Notificações de Imagem
    imageUploaded: () => 
      success('Imagem enviada!', 'Upload realizado com sucesso', 'save'),
    
    imageDeleted: () => 
      info('Imagem removida', 'A imagem foi excluída', 'trash'),
    
    // Notificações genéricas
    success,
    error,
    warning,
    info,
  };
};
