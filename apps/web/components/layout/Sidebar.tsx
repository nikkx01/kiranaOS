'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Receipt,
  History,
  BarChart3,
  Store,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Billing', href: '/billing', icon: Receipt },
  { label: 'Bills History', href: '/bills', icon: History },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex flex-col"
      style={{ width: 'var(--sidebar-width)', background: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-5 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 shadow-lg">
          <Store className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm tracking-wide">KiranaOS</p>
          <p className="text-xs text-blue-300">Point of Sale</p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 active-item scale-[1.02]'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white hover:translate-x-1',
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60 animate-in fade-in slide-in-from-left-1" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
