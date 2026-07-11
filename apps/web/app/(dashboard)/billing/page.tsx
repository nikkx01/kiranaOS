'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, Receipt, Loader2, CheckCircle } from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Product, CartItem, Bill } from '@/types';

export default function BillingPage() {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBill, setSavedBill] = useState<Bill | null>(null);
  const [notes, setNotes] = useState('');

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const res = await api.get<{ data: Product[] }>(`/api/products?search=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(res.data.data!);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchProducts(search), 300);
    return () => clearTimeout(t);
  }, [search, searchProducts]);

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert(`"${product.name}" is out of stock!`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.stockQty) {
          alert(`Cannot add more. Only ${product.stockQty} ${product.unit} available in stock.`);
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch('');
    setSearchResults([]);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item && delta > 0 && item.quantity + delta > item.product.stockQty) {
        alert(`Cannot exceed stock limit of ${item.product.stockQty} ${item.product.unit}.`);
        return prev;
      }
      return prev
        .map((i) => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0);
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, i) => acc + Number(i.product.sellingPrice) * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleSaveBill = async () => {
    if (!cart.length) return;
    setIsSaving(true);
    try {
      const payload = {
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        discount,
        notes,
      };
      const res = await api.post<{ data: Bill }>('/api/bills', payload);
      setSavedBill(res.data.data!);
      setCart([]);
      setDiscount(0);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Failed to save bill. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReceipt = (bill: Bill) => {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) return;

    const itemsHtml = bill.items
      ?.map(
        (item) => `
      <tr>
        <td style="padding: 4px 0; font-size: 13px;">${item.productName}</td>
        <td style="text-align: center; padding: 4px 0; font-size: 13px;">${item.quantity}</td>
        <td style="text-align: right; padding: 4px 0; font-size: 13px;">₹${Number(item.unitPrice).toFixed(2)}</td>
        <td style="text-align: right; padding: 4px 0; font-size: 13px;">₹${Number(item.subtotal).toFixed(2)}</td>
      </tr>`
      )
      .join('') ?? '';

    const storeName = localStorage.getItem('storeName') || 'Anand General Store';
    const storeAddress = localStorage.getItem('storeAddress') || 'Main Market, Sector 4, Patna, Bihar';
    const storePhone = localStorage.getItem('storePhone') || '+91 98765 43210';
    const storeGst = localStorage.getItem('storeGst') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${bill.billNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; font-family: 'Courier New', Courier, monospace; color: #000; width: 80mm; }
            }
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 300px; color: #333; }
            .header { text-align: center; margin-bottom: 15px; }
            .header h2 { margin: 0 0 5px 0; font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .header p { margin: 2px 0; font-size: 11px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { border-bottom: 1px dashed #000; padding: 5px 0; font-size: 12px; text-align: left; }
            .totals { margin-top: 10px; }
            .totals-row { display: flex; justify-content: space-between; font-size: 13px; margin: 3px 0; }
            .totals-row.grand-total { font-weight: bold; font-size: 15px; border-top: 1px dashed #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${storeName}</h2>
            <p>${storeAddress}</p>
            <p>Phone: ${storePhone}</p>
            ${storeGst ? `<p>GSTIN: ${storeGst}</p>` : ''}
            <div class="divider"></div>
            <p>Date: ${new Date(bill.createdAt).toLocaleString('en-IN')}</p>
            <p>Bill No: ${bill.billNumber}</p>
          </div>
          <div class="divider"></div>
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Rate</th>
                <th style="width: 20%; text-align: right;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="divider"></div>
          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${Number(bill.subtotal).toFixed(2)}</span>
            </div>
            ${
              Number(bill.discount) > 0
                ? `<div class="totals-row" style="color: green;">
                    <span>Discount:</span>
                    <span>-₹${Number(bill.discount).toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div class="totals-row grand-total">
              <span>GRAND TOTAL:</span>
              <span>₹${Number(bill.total).toFixed(2)}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Visit again</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (savedBill) {
    return (
      <div className="flex flex-col">
        <Topbar title="Billing" subtitle="Create new bills" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm w-full bg-white rounded-2xl border p-8 shadow-lg hover-zoom">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-900">Bill Saved!</h2>
            <p className="text-gray-500 mt-1 text-sm">{savedBill.billNumber}</p>
            <p className="text-3xl font-bold text-blue-600 mt-3">{formatCurrency(savedBill.total)}</p>
            
            <div className="mt-6 space-y-2">
              <button
                onClick={() => handlePrintReceipt(savedBill)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                <Receipt size={16} />
                Print Receipt
              </button>
              <button
                onClick={() => setSavedBill(null)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                New Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Topbar title="Billing" subtitle="Create new bills" />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          {/* Left: Product Search */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="rounded-xl border bg-white shadow-lg divide-y">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.sku} · Stock: {product.stockQty} {product.unit}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-gray-900 text-sm">{formatCurrency(product.sellingPrice)}</p>
                      <p className="text-xs text-gray-400">per {product.unit}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} className="text-gray-500" />
                  <span className="font-semibold text-sm text-gray-700">
                    Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <ShoppingCart size={40} className="mb-3" />
                  <p className="text-sm font-medium text-gray-400">Cart is empty</p>
                  <p className="text-xs text-gray-300 mt-1">Search and add products above</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-3 text-center">Qty</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  {cart.map(({ product, quantity }) => (
                    <div key={product.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50/50">
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.sku}</p>
                      </div>
                      <div className="col-span-2 text-center text-sm text-gray-600">
                        {formatCurrency(product.sellingPrice)}
                      </div>
                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateQty(product.id, -1)}
                          className="h-6 w-6 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQty(product.id, 1)}
                          className="h-6 w-6 flex items-center justify-center rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="col-span-2 text-right flex items-center justify-end gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(Number(product.sellingPrice) * quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(product.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Bill Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-white shadow-sm sticky top-6">
              <div className="flex items-center gap-2 px-5 py-4 border-b">
                <Receipt size={16} className="text-blue-600" />
                <h2 className="font-semibold text-gray-900">Bill Summary</h2>
              </div>

              <div className="px-5 py-4 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-sm text-right focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Regular customer…"
                    rows={2}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSaveBill}
                  disabled={cart.length === 0 || isSaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving Bill…</>
                  ) : (
                    <><Receipt size={16} /> Save Bill</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
