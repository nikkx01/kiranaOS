'use client';

import { useEffect, useState, useCallback } from 'react';
import { Receipt, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Bill, PaginationMeta } from '@/types';

function BillDetailModal({ billId, onClose }: { billId: string; onClose: () => void }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get<{ data: Bill }>(`/api/bills/${billId}`)
      .then((r) => setBill(r.data.data!))
      .finally(() => setIsLoading(false));
    return () => { document.body.style.overflow = ''; };
  }, [billId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-semibold text-gray-900">{bill?.billNumber ?? 'Loading…'}</h2>
            {bill && <p className="text-xs text-gray-400">{formatDate(bill.createdAt, true)}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : bill ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Product', 'Qty', 'Price', 'Subtotal'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {bill.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{item.productName}</td>
                    <td className="px-4 py-2.5 text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-900">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>

        {bill && (
          <div className="border-t px-6 py-4 bg-gray-50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            {Number(bill.discount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>- {formatCurrency(bill.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(bill.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewBillId, setViewBillId] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Bill[]; meta: PaginationMeta }>(
        `/api/bills?page=${page}&limit=15`
      );
      setBills(res.data.data!);
      setMeta(res.data.meta!);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const statusColors: Record<string, string> = {
    COMPLETED: 'bg-green-100 text-green-700',
    DRAFT: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex flex-col">
      <Topbar title="Bills History" subtitle="View all completed transactions" />

      <div className="flex-1 p-6 space-y-4">
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Bill #', 'Date & Time', 'Items', 'Discount', 'Total', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : bills.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                        <p className="text-gray-400 font-medium">No bills yet</p>
                      </td>
                    </tr>
                  )
                  : bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-blue-600">{bill.billNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(bill.createdAt, true)}</td>
                        <td className="px-4 py-3 text-gray-600">{bill._count?.items ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{Number(bill.discount) > 0 ? formatCurrency(bill.discount) : '—'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(bill.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[bill.status]}`}>
                            {bill.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setViewBillId(bill.id)}
                            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
              <p className="text-xs text-gray-500">
                Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} bills
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-600">Page {page} of {meta.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="rounded-lg border p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewBillId && (
        <BillDetailModal billId={viewBillId} onClose={() => setViewBillId(null)} />
      )}
    </div>
  );
}
