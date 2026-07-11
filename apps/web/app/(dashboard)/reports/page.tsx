'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  IndianRupee,
  Receipt,
  ShoppingBag,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { Topbar } from '@/components/layout/Topbar';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ReportSummary, BestSeller } from '@/types';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
}

function SummaryCard({ title, value, subtitle, icon, gradient }: SummaryCardProps) {
  return (
    <div className={`rounded-xl p-5 text-white shadow-md ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/70">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
        </div>
        <div className="rounded-xl bg-white/20 p-3">{icon}</div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, sellersRes] = await Promise.all([
        api.get<{ data: ReportSummary }>('/api/reports/summary'),
        api.get<{ data: BestSeller[] }>('/api/reports/best-sellers?limit=10'),
      ]);
      setSummary(summaryRes.data.data!);
      setBestSellers(sellersRes.data.data!);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const maxQty = bestSellers.length > 0 ? Math.max(...bestSellers.map((b) => b.totalQuantity)) : 1;

  return (
    <div className="flex flex-col">
      <Topbar title="Reports" subtitle={`Today's performance · ${today}`} />

      <div className="flex-1 p-6 space-y-6">
        {/* Refresh button */}
        <div className="flex justify-end">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Sales"
            value={isLoading ? '…' : formatCurrency(summary?.totalSales ?? 0)}
            subtitle="Revenue collected today"
            icon={<IndianRupee size={20} />}
            gradient="bg-gradient-to-br from-blue-500 to-blue-700"
          />
          <SummaryCard
            title="Net Profit"
            value={isLoading ? '…' : formatCurrency(summary?.totalProfit ?? 0)}
            subtitle="After cost of goods"
            icon={<TrendingUp size={20} />}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          />
          <SummaryCard
            title="Bills Created"
            value={isLoading ? '…' : formatNumber(summary?.totalBills ?? 0)}
            subtitle="Completed transactions"
            icon={<Receipt size={20} />}
            gradient="bg-gradient-to-br from-purple-500 to-purple-700"
          />
          <SummaryCard
            title="Avg Bill Value"
            value={isLoading ? '…' : formatCurrency(summary?.averageBillValue ?? 0)}
            subtitle="Per transaction average"
            icon={<ShoppingBag size={20} />}
            gradient="bg-gradient-to-br from-orange-400 to-orange-600"
          />
        </div>

        {/* Best Sellers */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <Trophy size={16} className="text-yellow-500" />
            <h2 className="font-semibold text-gray-900">Best-Selling Products Today</h2>
          </div>

          <div className="p-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-6 w-6 rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-gray-100 rounded mb-2" />
                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
              ))
            ) : bestSellers.length === 0 ? (
              <div className="py-12 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p className="text-gray-400 font-medium">No sales data today</p>
                <p className="text-gray-300 text-xs mt-1">Create some bills to see best sellers</p>
              </div>
            ) : (
              bestSellers.map((seller, idx) => {
                const barWidth = Math.round((seller.totalQuantity / maxQty) * 100);
                const isTop3 = idx < 3;
                return (
                  <div key={seller.productId} className="flex items-center gap-4">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-gray-300 text-gray-700' :
                      idx === 2 ? 'bg-orange-300 text-orange-800' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm truncate ${isTop3 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {seller.productName}
                        </p>
                        <div className="text-right ml-4 shrink-0">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(seller.totalRevenue)}</p>
                          <p className="text-xs text-gray-400">{seller.totalQuantity} units</p>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            idx === 0 ? 'bg-blue-500' :
                            idx === 1 ? 'bg-blue-400' :
                            idx === 2 ? 'bg-blue-300' :
                            'bg-blue-200'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary Row */}
        {summary && !isLoading && (
          <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-purple-50 p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Total Discount Given</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(summary.totalDiscount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Profit Margin</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {summary.totalSales > 0
                    ? `${((summary.totalProfit / summary.totalSales) * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Products Sold</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatNumber(bestSellers.reduce((acc, b) => acc + b.totalQuantity, 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Revenue After Discount</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{formatCurrency(summary.totalSales)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
