'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import type { User, AuthState } from '@/types/auth';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }
      try {
        const { data } = await api.auth.me();
        setState({
          user: data.data,
          accessToken: token,
          isAuthenticated: true,
          isLoading: false,
        });
        connectSocket(token);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.auth.login({ email, password });
    const { user, tokens } = data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    setState({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    connectSocket(tokens.accessToken);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    const { data } = await api.auth.register({ email, password, fullName });
    const { user, tokens } = data.data;

    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    setState({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });

    connectSocket(tokens.accessToken);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try { await api.auth.logout(refreshToken); } catch {}
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    disconnectSocket();

    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
