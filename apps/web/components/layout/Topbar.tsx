'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, User as UserIcon, LogOut, Settings, AlertTriangle, X, Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  // Settings Modal States
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'store'>('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [storeForm, setStoreForm] = useState({
    name: 'Anand General Store',
    address: 'Main Market, Sector 4, Patna, Bihar',
    phone: '+91 98765 43210',
    gstin: '10AAAAA1111A1Z1',
  });

  // Sync profile details when user is loaded
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  // Load store configuration from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('storeName');
    const savedAddress = localStorage.getItem('storeAddress');
    const savedPhone = localStorage.getItem('storePhone');
    const savedGst = localStorage.getItem('storeGst');
    if (savedName || savedAddress || savedPhone || savedGst) {
      setStoreForm({
        name: savedName || 'Anand General Store',
        address: savedAddress || 'Main Market, Sector 4, Patna, Bihar',
        phone: savedPhone || '+91 98765 43210',
        gstin: savedGst || '10AAAAA1111A1Z1',
      });
    }
  }, []);

  const handleSaveSettings = async () => {
    try {
      if (settingsTab === 'profile') {
        await updateProfile(profileForm.name, profileForm.email);
        alert('Profile details saved successfully!');
      } else {
        localStorage.setItem('storeName', storeForm.name);
        localStorage.setItem('storeAddress', storeForm.address);
        localStorage.setItem('storePhone', storeForm.phone);
        localStorage.setItem('storeGst', storeForm.gstin);
        
        // Dispatch custom event to let other components (like Sidebar or Print Receipt) reload immediately
        window.dispatchEvent(new Event('storeSettingsUpdated'));
        alert('Store settings saved successfully!');
      }
      setShowSettingsModal(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save settings. Please try again.');
    }
  };


  // Fetch low stock items for notifications (stock <= 10)
  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await api.get<{ data: Product[] }>('/api/products?limit=100');
        const lowStock = res.data.data!.filter((p) => p.stockQty <= 10);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error('Failed to fetch stock alerts:', err);
      }
    };
    fetchLowStock();
  }, []);

  // Handle global product search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get<{ data: Product[] }>(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(res.data.data!);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur px-6 shadow-sm">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 relative">
        {/* Search button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          title="Global Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications bell button */}
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
          title="Stock Alerts"
        >
          <Bell size={18} />
          {lowStockProducts.length > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
              {lowStockProducts.length}
            </span>
          )}
        </button>

        {/* Profile Avatar Button */}
        <button
          onClick={() => setShowProfileDropdown((prev) => !prev)}
          className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'A'}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-12 top-10 mt-2 w-80 rounded-xl border bg-white shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Stock Alerts</span>
                <span className="text-xs text-red-500 font-medium">{lowStockProducts.length} warnings</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y">
                {lowStockProducts.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-gray-400">All products are well stocked!</p>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setShowNotifications(false);
                        router.push(`/products`);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3 cursor-pointer"
                    >
                      <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-500">Only {p.stockQty} {p.unit} left in stock</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Profile Dropdown Menu */}
        {showProfileDropdown && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowProfileDropdown(false)} />
            <div className="absolute right-0 top-10 mt-2 w-56 rounded-xl border bg-white shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-950">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <div
                  onClick={() => {
                    setShowSettingsModal(true);
                    setSettingsTab('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <UserIcon size={16} className="text-gray-400" />
                  <span>Profile Settings</span>
                </div>
                <div
                  onClick={() => {
                    setShowSettingsModal(true);
                    setSettingsTab('store');
                    setShowProfileDropdown(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Settings size={16} className="text-gray-400" />
                  <span>Store Settings</span>
                </div>
              </div>

              <div className="border-t py-1">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer text-left"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings Modal Dialog */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowSettingsModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900">Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b">
              <button
                onClick={() => setSettingsTab('profile')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                  settingsTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Profile Settings
              </button>
              <button
                onClick={() => setSettingsTab('store')}
                className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                  settingsTab === 'store'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Store Settings
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto">
              {settingsTab === 'profile' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">User Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Store Address</label>
                    <input
                      type="text"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={storeForm.gstin}
                      onChange={(e) => setStoreForm({ ...storeForm, gstin: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-950 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal Overlay */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowSearchModal(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border">
            {/* Input field */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products globally by name or SKU…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none border-none text-gray-900 placeholder:text-gray-400"
                autoFocus
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchModal(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results listing */}
            <div className="max-h-72 overflow-y-auto divide-y">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs text-gray-400">No products match your search</p>
              ) : searchQuery.trim() ? (
                searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchQuery('');
                      router.push(`/products`);
                    }}
                    className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Package size={16} className="text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[10px] text-gray-400">SKU: {p.sku} · Stock: {p.stockQty} {p.unit}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(p.sellingPrice)}</span>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-xs text-gray-400">Type above to begin searching catalog</p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

