'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, User, MessageCircle, Loader2, LogIn, Save, Home, Edit3, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCart } from '@/context/CartContext';
import { links } from '@/config/links.config';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

type AddressOption = 'saved' | 'new';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const { profile, isAuthenticated, updateProfile } = useCustomerAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressOption, setAddressOption] = useState<AddressOption>('saved');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [notes, setNotes] = useState('');

  // Verificar se tem endereço salvo
  const hasSavedAddress = profile?.address && profile.address.trim() !== '';

  // Preencher com dados do perfil quando autenticado
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      
      // Se tem endereço salvo, usar ele por padrão
      if (hasSavedAddress && addressOption === 'saved') {
        setAddress(profile.address || '');
        setNeighborhood(profile.neighborhood || '');
        setComplement(profile.complement || '');
      }
      
      // Se não tem endereço salvo, forçar opção "new"
      if (!hasSavedAddress) {
        setAddressOption('new');
      }
    }
  }, [profile, hasSavedAddress, addressOption]);

  // Quando mudar a opção de endereço
  useEffect(() => {
    if (addressOption === 'saved' && profile) {
      setAddress(profile.address || '');
      setNeighborhood(profile.neighborhood || '');
      setComplement(profile.complement || '');
    } else if (addressOption === 'new') {
      setAddress('');
      setNeighborhood('');
      setComplement('');
    }
  }, [addressOption, profile]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determinar qual endereço usar
    let finalAddress = address;
    let finalNeighborhood = neighborhood;
    let finalComplement = complement;

    // Se usar endereço salvo, pegar do perfil
    if (isAuthenticated && hasSavedAddress && addressOption === 'saved') {
      finalAddress = profile?.address || '';
      finalNeighborhood = profile?.neighborhood || '';
      finalComplement = profile?.complement || '';
    }

    if (!name.trim() || !phone.trim() || !finalAddress.trim()) {
      alert('Preencha nome, telefone e endereço');
      return;
    }

    setIsLoading(true);

    // Salvar endereço no perfil se autenticado e marcado para salvar (apenas quando usar outro endereço)
    if (isAuthenticated && saveAddress && addressOption === 'new') {
      await updateProfile({
        name,
        phone,
        address: finalAddress,
        neighborhood: finalNeighborhood,
        complement: finalComplement,
      });
    }

    // Montar mensagem do WhatsApp
    const orderItems = items.map(item => 
      `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price! * item.quantity)}`
    ).join('\n');

    const fullAddress = [finalAddress, finalNeighborhood, finalComplement].filter(Boolean).join(', ');

    const message = `🛒 *NOVO PEDIDO - Farmácia Mais Saúde*

👤 *Cliente:* ${name}
📱 *Telefone:* ${phone}
📍 *Endereço:* ${fullAddress}

📦 *Itens do Pedido:*
${orderItems}

💰 *Total:* ${formatCurrency(totalPrice)}

${notes ? `📝 *Observações:* ${notes}` : ''}

_Pedido realizado pelo catálogo digital_`;

    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${links.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Limpar carrinho e fechar
    clearCart();
    setIsLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-lg md:max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Finalizar Pedido</h2>
                <p className="text-green-100 text-sm">Via WhatsApp</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-invisible p-6">
              {/* Login Suggestion */}
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <LogIn className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800 font-medium">
                        Faça login para salvar seus dados
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Suas próximas compras serão mais rápidas
                      </p>
                      <button
                        onClick={onOpenAuth}
                        className="mt-2 text-sm font-semibold text-blue-700 hover:underline"
                      >
                        Entrar ou criar conta
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resumo do Pedido */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-invisible">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.quantity}x {item.name}</span>
                      <span className="font-medium">{formatCurrency(item.price! * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nome completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>

                {/* Seleção de Endereço - Aparece quando está logado */}
                {isAuthenticated && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Endereço de entrega *
                    </label>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {/* Opção: Usar endereço cadastrado (só se tiver endereço salvo) */}
                      {hasSavedAddress ? (
                        <button
                          type="button"
                          onClick={() => setAddressOption('saved')}
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                            addressOption === 'saved'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            addressOption === 'saved'
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {addressOption === 'saved' && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Home size={16} className={addressOption === 'saved' ? 'text-green-600' : 'text-gray-400'} />
                              <span className={`font-medium ${addressOption === 'saved' ? 'text-green-700' : 'text-gray-700'}`}>
                                Endereço cadastrado
                              </span>
                            </div>
                            <p className={`text-sm mt-1 truncate ${addressOption === 'saved' ? 'text-green-600' : 'text-gray-500'}`}>
                              {profile?.address}
                              {profile?.neighborhood && `, ${profile.neighborhood}`}
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-left">
                          <Home size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <span className="font-medium text-gray-500">Nenhum endereço cadastrado</span>
                            <p className="text-sm text-gray-400 mt-0.5">Digite seu endereço abaixo</p>
                          </div>
                        </div>
                      )}

                      {/* Opção: Usar outro endereço */}
                      <button
                        type="button"
                        onClick={() => setAddressOption('new')}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          addressOption === 'new' || !hasSavedAddress
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          addressOption === 'new' || !hasSavedAddress
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {(addressOption === 'new' || !hasSavedAddress) && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit3 size={16} className={addressOption === 'new' || !hasSavedAddress ? 'text-green-600' : 'text-gray-400'} />
                          <span className={`font-medium ${addressOption === 'new' || !hasSavedAddress ? 'text-green-700' : 'text-gray-700'}`}>
                            {hasSavedAddress ? 'Usar outro endereço' : 'Digitar endereço'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Campos de endereço - visíveis se: não logado, não tem endereço salvo, ou escolheu "outro endereço" */}
                {(!isAuthenticated || !hasSavedAddress || addressOption === 'new') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Endereço *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Rua, número"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Bairro"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                          placeholder="Apto, bloco..."
                        />
                      </div>
                    </div>

                    {/* Salvar endereço - aparece quando logado e está digitando um endereço */}
                    {isAuthenticated && (
                      <label className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                          <Save size={16} className="text-blue-500" />
                          <span className="text-sm text-blue-700">
                            {hasSavedAddress ? 'Salvar como meu endereço principal' : 'Salvar este endereço para próximas compras'}
                          </span>
                        </div>
                      </label>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Observações
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none resize-none"
                    placeholder="Alguma observação sobre o pedido?"
                    rows={2}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} />
                      Enviar Pedido via WhatsApp
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
