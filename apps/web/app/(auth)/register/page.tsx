'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth, AuthProvider } from '@/hooks/useAuth';

const PERKS = [
  'Add your own products and set your own prices',
  'Billing terminal ready — make your first purja today',
  'Your shop name printed on every receipt',
  'Full sales history & profit reports',
  'Complete data privacy — only you can see your data',
];

function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register(name, email, password, shopName);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-12">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute bottom-[-60px] right-[-60px] h-[350px] w-[350px] rounded-full bg-indigo-600/20 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-500/40">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">KiranaOS</span>
        </div>

        {/* Hero */}
        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Free to get started — no card needed</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Set up your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              digital shop today.
            </span>
          </h1>

          <p className="text-base text-slate-400 leading-relaxed max-w-sm">
            Register in under a minute. Your store will be pre-loaded with
            200+ common grocery items so you can start billing your first
            customer immediately.
          </p>

          {/* Perks */}
          <div className="space-y-3 pt-2">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-sm text-slate-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back to login */}
        <div className="relative">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Already have a store? Sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Right Panel: Register Form ── */}
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
            <h2 className="text-2xl font-bold text-white">Create your store</h2>
            <p className="text-sm text-slate-400 mt-1.5">
              Get your digital kirana shop running in seconds.
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
              <label htmlFor="shopName" className="block text-sm font-medium text-slate-300 mb-1.5">
                Shop Name
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                placeholder="e.g. Sharma General Store"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Ramesh Sharma"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>

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
                  placeholder="Min. 6 characters"
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
                  Setting up your store…
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Create Store & Start Billing
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Already have a store?{' '}
            <Link href="/login" className="text-blue-400 hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
