import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'آراد نوایی',
    email: 'aradnavaee@gmail.com',
    password: 'Admin@1234',
    role: 'admin',
    isVerified: true,
    createdAt: '2024-01-15',
    avatar: '',
  },
  {
    id: '2',
    name: 'محمد نوایی',
    email: 'mohamadnavaee@gmail.com',
    password: 'User@1234',
    role: 'user',
    isVerified: true,
    createdAt: '2024-03-22',
    avatar: '',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('ramzinex_token');
    const storedUser = localStorage.getItem('ramzinex_user');
    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setState({ user, token: storedToken, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem('ramzinex_token');
        localStorage.removeItem('ramzinex_user');
        setState(s => ({ ...s, isLoading: false }));
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...user } = found;
      const token = `mock_jwt_${Date.now()}_${user.id}`;
      localStorage.setItem('ramzinex_token', token);
      localStorage.setItem('ramzinex_user', JSON.stringify(user));
      setState({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, message: 'ورود موفقیت‌آمیز بود' };
    }
    return { success: false, message: 'ایمیل یا رمز عبور اشتباه است' };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 1000));
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) {
      return { success: false, message: 'این ایمیل قبلاً ثبت شده است' };
    }
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role: 'user',
      isVerified: false,
      createdAt: new Date().toISOString(),
      avatar: '',
    };
    MOCK_USERS.push({ ...newUser, password });
    const token = `mock_jwt_${Date.now()}_${newUser.id}`;
    localStorage.setItem('ramzinex_token', token);
    localStorage.setItem('ramzinex_user', JSON.stringify(newUser));
    setState({ user: newUser, token, isAuthenticated: true, isLoading: false });
    return { success: true, message: 'ثبت‌نام موفقیت‌آمیز بود. ایمیل تأیید ارسال شد.' };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ramzinex_token');
    localStorage.removeItem('ramzinex_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }, []);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('ramzinex_user', JSON.stringify(user));
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
