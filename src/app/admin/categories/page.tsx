'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, FolderTree, Edit, Trash2, GripVertical } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { InputField } from '@/components/admin/FormField';
import { Category } from '@/types/database';
import { useAdminToast } from '@/hooks/useAdminToast';

interface CategoryFormData {
  name: string;
  slug: string;
  sort: number;
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  sort: 0,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  
  const toast = useAdminToast();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        sort: category.sort,
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        ...initialFormData,
        sort: categories.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData(initialFormData);
  };

  const handleChange = (field: keyof CategoryFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && !selectedCategory) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = selectedCategory
        ? `/api/admin/categories/${selectedCategory.id}`
        : '/api/admin/categories';
      
      const method = selectedCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erro ao salvar categoria');

      await fetchCategories();
      handleCloseModal();
      
      if (selectedCategory) {
        toast.itemUpdated('Categoria');
      } else {
        toast.itemCreated('Categoria');
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.operationFailed('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao excluir categoria');

      await fetchCategories();
      setIsDeleteDialogOpen(false);
      toast.itemDeleted('Categoria');
      setSelectedCategory(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.operationFailed('Erro ao excluir categoria. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const columns = [
    {
      key: 'sort',
      header: '',
      className: 'w-12',
      render: () => (
        <GripVertical className="w-4 h-4 text-gray-300" />
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      render: (category: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {category.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{category.name}</p>
            <p className="text-xs text-gray-500">/{category.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Ordem',
      render: (category: Category) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
          {category.sort}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (category: Category) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(category); }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openDeleteDialog(category); }}
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
        <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <DataTable
          columns={columns}
          data={categories}
          isLoading={isLoading}
          emptyMessage="Nenhuma categoria cadastrada"
          emptyIcon={<FolderTree className="w-12 h-12 opacity-20" />}
        />
      </div>

      {/* Modal de Criação/Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Nome"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Nome da categoria"
          />
          
          <InputField
            label="Slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            required
            placeholder="slug-da-categoria"
          />

          <InputField
            label="Ordem"
            type="number"
            min="0"
            value={formData.sort.toString()}
            onChange={(e) => handleChange('sort', parseInt(e.target.value) || 0)}
            placeholder="0"
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
              {isSaving ? 'Salvando...' : selectedCategory ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dialog de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir "${selectedCategory?.name}"? Produtos desta categoria ficarão sem categoria.`}
        confirmLabel="Excluir"
        isLoading={isSaving}
      />
    </div>
  );
}
