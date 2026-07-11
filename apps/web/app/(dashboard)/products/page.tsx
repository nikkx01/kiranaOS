'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Package, RefreshCw } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Product, Category, ProductFormData } from '@/types';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100', ...(search && { search }) });
      const [prodRes, catRes] = await Promise.all([
        api.get<{ data: Product[] }>(`/api/products?${params}`),
        api.get<{ data: Category[] }>('/api/categories'),
      ]);
      setProducts(prodRes.data.data!);
      setCategories(catRes.data.data!);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const handleSave = async (data: ProductFormData) => {
    if (editProduct) {
      await api.put(`/api/products/${editProduct.id}`, data);
    } else {
      await api.post('/api/products', data);
    }
    setShowModal(false);
    setEditProduct(null);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await api.delete(`/api/products/${deleteTarget.id}`);
    setDeleteTarget(null);
    fetchProducts();
  };

  return (
    <div className="flex flex-col">
      <Topbar title="Products" subtitle="Manage your product catalog" />

      <div className="flex-1 p-6 space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => { setEditProduct(null); setShowModal(true); }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Name', 'SKU', 'Category', 'Stock', 'Cost Price', 'Selling Price', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-gray-100 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                      <p className="text-gray-400 font-medium">No products found</p>
                      <p className="text-gray-400 text-xs mt-1">Add your first product to get started</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stockQty <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                          {product.stockQty} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditProduct(product); setShowModal(true); }}
                            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This will soft-delete it and hide it from active listings.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
