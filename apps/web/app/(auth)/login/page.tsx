'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Eye,
  EyeOff,
  Loader2,
  ShoppingCart,
  BarChart3,
  Package,
  Receipt,
  CheckCircle2,
  Zap,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/hooks/useAuth';

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Fast Billing Terminal',
    desc: 'Scan, add items, and checkout in seconds. Built for speed.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    desc: 'Track products, stock quantities, and get low-stock alerts before you run out.',
  },
  {
    icon: BarChart3,
    title: 'Sales & Reports',
    desc: "Daily revenue, profit, and top-sellers — know your shop's pulse.",
  },
  {
    icon: Receipt,
    title: 'Thermal Receipt Printing',
    desc: 'Print GST-ready receipts with your shop name and details.',
  },
];

const STATS = [
  { value: 'Unlimited', label: 'Products & Stock' },
  { value: '30 Days', label: 'Sales History' },
  { value: '100%', label: 'Data Isolated' },
];

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── Left Panel: Product Showcase ── */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-60px] right-[-60px] h-[350px] w-[350px] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 h-[200px] w-[200px] rounded-full bg-cyan-500/10 blur-[80px]" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/40">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">KiranaOS</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">Built for Indian Grocery Shops</span>
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight">
            Run your kirana shop
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              the smart way.
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            KiranaOS is a complete digital billing and inventory platform designed
            for local grocery store owners. Ditch the manual khata — go digital today.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 pt-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-xl border border-white/8 bg-white/5 backdrop-blur-sm p-4 hover:bg-white/8 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 mb-3">
                  <feat.icon className="h-4.5 w-4.5 text-blue-400" size={18} />
                </div>
                <p className="text-sm font-semibold text-white">{feat.title}</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust badge */}
        <div className="relative flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="h-3.5 w-3.5" />
          <span>Your data is 100% private and isolated. No one else can see your shop records.</span>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-slate-950">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">KiranaOS</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Sign in to your store</h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@yourshop.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/8" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-950 px-3 text-xs text-slate-600">New to KiranaOS?</span>
            </div>
          </div>

          {/* Register CTA */}
          <Link
            href="/register"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Store size={15} />
            Register your shop — it's free
          </Link>

          {/* What you get */}
          <div className="mt-6 rounded-xl border border-white/6 bg-white/3 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-400 mb-3">What you get after registering:</p>
            {[
              'Add your own products with your own prices',
              'Instant billing terminal — make purja from day one',
              'Your shop name on every printed receipt',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-slate-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
