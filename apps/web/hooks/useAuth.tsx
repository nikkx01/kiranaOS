'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse } from '@/types';
import { api } from '@/lib/api';
import { saveAuth, getUser, clearAuth, getToken } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, shopName: string) => Promise<void>;
  updateProfile: (name: string, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await api.post<{ data: AuthResponse }>('/api/auth/login', { email, password });
    const { token, user: loggedInUser } = res.data.data!;
    saveAuth(token, loggedInUser);
    // Also set a cookie for middleware
    document.cookie = `kirana_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    setUser(loggedInUser);
    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string, shopName: string): Promise<void> => {
    const res = await api.post<{ data: AuthResponse }>('/api/auth/register', { name, email, password, shopName });
    const { token, user: loggedInUser } = res.data.data!;
    
    // Save shop configuration to local storage so settings dialog correctly initializes with it
    localStorage.setItem('storeName', shopName);
    localStorage.setItem('storeAddress', 'Main Market, Sector 4, Patna, Bihar');
    localStorage.setItem('storePhone', '+91 98765 43210');
    localStorage.setItem('storeGst', '');

    saveAuth(token, loggedInUser);
    document.cookie = `kirana_token=${token}; path=/; max-age=86400; SameSite=Strict`;
    setUser(loggedInUser);
    
    // Notify app components that store configuration has changed
    window.dispatchEvent(new Event('storeSettingsUpdated'));
    router.push('/dashboard');
  };

  const updateProfile = async (name: string, email: string): Promise<void> => {
    const res = await api.put<{ data: User }>('/api/auth/profile', { name, email });
    const updatedUser = res.data.data!;
    const token = getToken() || '';
    saveAuth(token, updatedUser);
    setUser(updatedUser);
  };

  const logout = (): void => {
    clearAuth();
    document.cookie = 'kirana_token=; path=/; max-age=0';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
