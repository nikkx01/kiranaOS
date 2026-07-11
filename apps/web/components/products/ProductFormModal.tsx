'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Product, Category, ProductFormData, ProductUnit } from '@/types';

const UNITS: ProductUnit[] = ['PCS', 'KG', 'G', 'L', 'ML', 'PACK', 'BOX', 'DOZEN'];

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  onSave: (data: ProductFormData) => Promise<void>;
  onClose: () => void;
}

export function ProductFormModal({ product, categories, onSave, onClose }: ProductFormModalProps) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    description: product?.description ?? '',
    categoryId: product?.categoryId ?? '',
    sellingPrice: Number(product?.sellingPrice ?? 0),
    costPrice: Number(product?.costPrice ?? 0),
    stockQty: product?.stockQty ?? 0,
    unit: product?.unit ?? 'PCS',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleChange = (key: keyof ProductFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.sellingPrice < form.costPrice) {
      setError('Selling price should not be less than cost price.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(form);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const margin = form.sellingPrice > 0 && form.costPrice > 0
    ? (((form.sellingPrice - form.costPrice) / form.sellingPrice) * 100).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Product Name *</label>
                <input className="input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="e.g. Parle-G Biscuits" />
              </div>

              <div>
                <label className="label">SKU *</label>
                <input className="input font-mono" value={form.sku} onChange={(e) => handleChange('sku', e.target.value.toUpperCase())} required placeholder="e.g. SNCK-001" />
              </div>

              <div>
                <label className="label">Unit</label>
                <select className="input" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Cost Price (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)} required />
              </div>

              <div>
                <label className="label">Selling Price (₹) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)} required />
                {margin && (
                  <p className="text-xs text-green-600 mt-1">Margin: {margin}%</p>
                )}
              </div>

              <div>
                <label className="label">Stock Qty</label>
                <input className="input" type="number" min="0" value={form.stockQty} onChange={(e) => handleChange('stockQty', parseInt(e.target.value) || 0)} />
              </div>

              <div>
                <label className="label">Category</label>
                <select className="input" value={form.categoryId ?? ''} onChange={(e) => handleChange('categoryId', e.target.value)}>
                  <option value="">— No category —</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description ?? ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Optional description…" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : isEdit ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label { display: block; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }
        .input { width: 100%; border-radius: 0.5rem; border: 1px solid #E5E7EB; background: white; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #111827; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .input:focus { border-color: #3B82F6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
      `}</style>
    </div>
  );
}
