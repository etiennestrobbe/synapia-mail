'use client';

import { useState, useEffect } from 'react';
import { buildApiUrl, getAuthHeaders, API_CONFIG } from '../lib/config';
import { useTranslation } from 'react-i18next';

interface Category {
  readonly _id: string;
  readonly name: string;
  readonly description?: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES), {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', response.status);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const url = editingCategory
      ? `${buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES)}/${editingCategory._id}`
      : buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES);
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', description: '' });
        setShowForm(false);
        setEditingCategory(null);
        await fetchCategories(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Handle different error types
        if (response.status === 401) {
          setError(t('unauthorized'));
        } else {
          setError(errorData.message || t('validationError'));
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteCategory'))) return;

    try {
      const response = await fetch(`${buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES)}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchCategories(); // Refresh the list
      } else {
        console.error('Failed to delete category:', response.status);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowForm(true);
    setError('');
  };

  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">{t('categoryManagement')}</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
            setError('');
          }}
          className="btn-primary"
        >
          {t('addCategory')}
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-medium text-card-foreground mb-4">
            {editingCategory ? t('editCategory') : t('addCategory')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('categoryName')}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                placeholder={t('categoryName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('categoryDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input-field w-full"
                placeholder={t('categoryDescription')}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50"
              >
                {submitting ? t('loading') : (editingCategory ? t('update') : t('create'))}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                  setError('');
                }}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <ul className="divide-y divide-border">
          {categories.map((category) => (
            <li key={category._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{category.name}</h4>
                  {category.description && (
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    {t('edit')}
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-6 py-8 text-center text-muted-foreground">
              {t('noCategories')}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
