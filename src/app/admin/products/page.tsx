'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { ActiveBadge } from '@/components/admin/StatusBadge';
import { InputField, TextareaField, SelectField, ToggleField } from '@/components/admin/FormField';
import { Product, Category } from '@/types/database';
import { useAdminToast } from '@/hooks/useAdminToast';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  active: boolean;
  category_id: string;
  whatsapp_message: string;
  images: string[];
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: '',
  active: true,
  category_id: '',
  whatsapp_message: '',
  images: [],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const toast = useAdminToast();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price?.toString() || '',
        active: product.active,
        category_id: product.category_id || '',
        whatsapp_message: product.whatsapp_message || '',
        images: product.images?.map(img => img.url) || [],
      });
    } else {
      setSelectedProduct(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData(initialFormData);
    setNewImageUrl('');
  };

  const handleChange = (field: keyof ProductFormData, value: string | boolean | string[]) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !selectedProduct) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        category_id: formData.category_id || null,
      };

      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products';
      
      const method = selectedProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Erro ao salvar produto');

      await fetchProducts();
      handleCloseModal();
      
      // Notificação de sucesso
      if (selectedProduct) {
        toast.itemUpdated('Produto');
      } else {
        toast.itemCreated('Produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.operationFailed('Erro ao salvar produto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir produto');

      await fetchProducts();
      setIsDeleteDialogOpen(false);
      toast.itemDeleted('Produto');
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.operationFailed('Erro ao excluir produto. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'image',
      header: '',
      className: 'w-16',
      render: (product: Product) => (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Produto',
      render: (product: Product) => (
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">{product.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (product: Product) => (
        <span className="text-gray-600">{product.category?.name || '-'}</span>
      ),
    },
    {
      key: 'price',
      header: 'Preço',
      render: (product: Product) => (
        <span className="font-medium">
          {product.price ? `R$ ${product.price.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (product: Product) => <ActiveBadge active={product.active} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (product: Product) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(product); }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteDialog(product); }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredProducts}
          isLoading={isLoading}
          emptyMessage="Nenhum produto cadastrado"
          emptyIcon={<Package className="w-12 h-12 opacity-20" />}
        />
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Editar Produto' : 'Novo Produto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Nome"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="Nome do produto"
            />
            <InputField
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              required
              placeholder="slug-do-produto"
            />
          </div>

          <TextareaField
            label="Descrição"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrição detalhada do produto..."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Preço"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
            />
            <SelectField
              label="Categoria"
              value={formData.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>

          <TextareaField
            label="Mensagem WhatsApp"
            value={formData.whatsapp_message}
            onChange={(e) => handleChange('whatsapp_message', e.target.value)}
            placeholder="Olá, tenho interesse no produto..."
          />

          {/* Imagens */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Imagens</label>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL da imagem"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Adicionar
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ToggleField
            label="Produto ativo"
            checked={formData.active}
            onChange={(checked) => handleChange('active', checked)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : selectedProduct ? 'Salvar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${selectedProduct?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isSaving}
      />
    </div>
  );
}
