'use client';

import { useEffect, useState, ReactNode } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  Receipt,
  ArrowRight,
  IndianRupee,
  BarChart3,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReportSummary, Bill, BestSeller } from '@/types';

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ title, value, icon, iconBg, trend, trendUp }: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend}
            </div>
          )}
        </div>
        <div className={`${iconBg} rounded-lg p-3`}>{icon}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, billsRes, sellersRes] = await Promise.all([
          api.get<{ data: ReportSummary }>('/api/reports/summary'),
          api.get<{ data: Bill[] }>('/api/bills?limit=5'),
          api.get<{ data: BestSeller[] }>('/api/reports/best-sellers?limit=5'),
        ]);
        setSummary(summaryRes.data.data!);
        setRecentBills(billsRes.data.data!);
        setBestSellers(sellersRes.data.data!);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col">
      <Topbar title="Dashboard" subtitle={today} />

      <div className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Today's Sales"
            value={isLoading ? '…' : formatCurrency(summary?.totalSales ?? 0)}
            icon={<IndianRupee size={20} className="text-blue-600" />}
            iconBg="bg-blue-50"
            trend="vs yesterday"
            trendUp
          />
          <KpiCard
            title="Today's Profit"
            value={isLoading ? '…' : formatCurrency(summary?.totalProfit ?? 0)}
            icon={<TrendingUp size={20} className="text-green-600" />}
            iconBg="bg-green-50"
            trend="net margin"
            trendUp
          />
          <KpiCard
            title="Bills Today"
            value={isLoading ? '…' : String(summary?.totalBills ?? 0)}
            icon={<Receipt size={20} className="text-purple-600" />}
            iconBg="bg-purple-50"
          />
          <KpiCard
            title="Avg Bill Value"
            value={isLoading ? '…' : formatCurrency(summary?.averageBillValue ?? 0)}
            icon={<ShoppingCart size={20} className="text-orange-600" />}
            iconBg="bg-orange-50"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { label: 'New Bill', href: '/billing', icon: Receipt, color: 'bg-blue-600 hover:bg-blue-700' },
            { label: 'Add Product', href: '/products', icon: Package, color: 'bg-green-600 hover:bg-green-700' },
            { label: 'View Reports', href: '/reports', icon: BarChart3, color: 'bg-purple-600 hover:bg-purple-700' },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`${color} flex items-center justify-between rounded-xl p-4 text-white shadow-sm transition-all hover:shadow-md`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-semibold">{label}</span>
              </div>
              <ArrowRight size={16} className="opacity-70" />
            </Link>
          ))}
        </div>

        {/* Two column: Recent Bills + Best Sellers */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Bills */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Recent Bills</h2>
              <Link href="/bills" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3 animate-pulse">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-4 w-20 bg-gray-100 rounded" />
                    </div>
                  ))
                : recentBills.length === 0
                ? (
                  <p className="px-6 py-8 text-center text-sm text-gray-400">No bills today</p>
                )
                : recentBills.map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bill.billNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(bill.createdAt, true)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(bill.total)}</p>
                        <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Best Sellers */}
          <div className="rounded-xl border bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Top Products Today</h2>
              <Link href="/reports" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Full report <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3 animate-pulse">
                      <div className="h-4 w-40 bg-gray-100 rounded" />
                      <div className="h-4 w-16 bg-gray-100 rounded" />
                    </div>
                  ))
                : bestSellers.length === 0
                ? <p className="px-6 py-8 text-center text-sm text-gray-400">No data today</p>
                : bestSellers.map((seller, idx) => (
                    <div key={seller.productId} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{seller.productName}</p>
                        <p className="text-xs text-gray-400">{seller.totalQuantity} units sold</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(seller.totalRevenue)}</p>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
