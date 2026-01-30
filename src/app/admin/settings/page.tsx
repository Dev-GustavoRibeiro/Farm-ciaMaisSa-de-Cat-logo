'use client';

import React, { useState, useEffect } from 'react';
import { Save, Store, Phone, Palette, MessageSquare, Loader2 } from 'lucide-react';
import { InputField, TextareaField, ToggleField } from '@/components/admin/FormField';
import { useAdminToast } from '@/hooks/useAdminToast';

interface StoreSettings {
  store_name: string;
  store_description: string;
  whatsapp_number: string;
  address: string;
  business_hours: string;
  primary_color: string;
  welcome_message: string;
  order_confirmation_message: string;
  enable_whatsapp_orders: boolean;
  show_prices: boolean;
  show_stock: boolean;
}

const defaultSettings: StoreSettings = {
  store_name: 'Farmácia Mais Saúde',
  store_description: 'Sua farmácia de confiança em Ipirá! Medicamentos, higiene, beleza e muito mais.',
  whatsapp_number: '5575991357869',
  address: 'Ipirá - Bahia',
  business_hours: 'Seg a Sáb: 7h às 21h',
  primary_color: '#1e3a5f',
  welcome_message: 'Olá! Bem-vindo à Farmácia Mais Saúde. Como posso ajudar?',
  order_confirmation_message: 'Obrigado pelo seu pedido! Em breve entraremos em contato para confirmar.',
  enable_whatsapp_orders: true,
  show_prices: true,
  show_stock: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const toast = useAdminToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Erro ao salvar configurações');

      toast.settingsSaved();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.operationFailed('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações da Loja */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Store size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Informações da Loja</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nome da Loja"
              value={settings.store_name}
              onChange={(e) => handleChange('store_name', e.target.value)}
              placeholder="Minha Loja"
            />
            
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <InputField
                  label="Cor Principal"
                  value={settings.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-12 h-[42px] rounded-xl border border-gray-200 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                label="Descrição da Loja"
                value={settings.store_description}
                onChange={(e) => handleChange('store_description', e.target.value)}
                placeholder="Uma breve descrição sobre sua loja..."
              />
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-xl text-green-600">
              <Phone size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Contato</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Número do WhatsApp"
              value={settings.whatsapp_number}
              onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              placeholder="5511999999999"
            />
            
            <InputField
              label="Horário de Funcionamento"
              value={settings.business_hours}
              onChange={(e) => handleChange('business_hours', e.target.value)}
              placeholder="Seg-Sex: 9h às 18h"
            />

            <div className="md:col-span-2">
              <TextareaField
                label="Endereço"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Rua Exemplo, 123 - Cidade, Estado"
              />
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Mensagens</h2>
          </div>

          <div className="space-y-6">
            <TextareaField
              label="Mensagem de Boas-vindas"
              value={settings.welcome_message}
              onChange={(e) => handleChange('welcome_message', e.target.value)}
              placeholder="Olá! Bem-vindo à nossa loja."
            />
            
            <TextareaField
              label="Mensagem de Confirmação de Pedido"
              value={settings.order_confirmation_message}
              onChange={(e) => handleChange('order_confirmation_message', e.target.value)}
              placeholder="Obrigado pelo seu pedido! Em breve entraremos em contato."
            />
          </div>
        </div>

        {/* Opções de Exibição */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
              <Palette size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Opções de Exibição</h2>
          </div>

          <div className="space-y-4">
            <ToggleField
              label="Habilitar pedidos via WhatsApp"
              checked={settings.enable_whatsapp_orders}
              onChange={(checked) => handleChange('enable_whatsapp_orders', checked)}
            />
            
            <ToggleField
              label="Exibir preços no catálogo"
              checked={settings.show_prices}
              onChange={(checked) => handleChange('show_prices', checked)}
            />
            
            <ToggleField
              label="Exibir informações de estoque"
              checked={settings.show_stock}
              onChange={(checked) => handleChange('show_stock', checked)}
            />
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
