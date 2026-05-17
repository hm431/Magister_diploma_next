'use client';

import { create } from 'zustand';
import apiClient from './api-client';

export interface CurrentUser {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

// Role hierarchy constants
export const ROLES = {
  ADMIN: 'admin',
  PM: 'pm',                  // Руководитель проекта
  PTO: 'pto',                // Специалист ПТО
  MTS: 'mts',                // Специалист МТС
  DIRECTOR: 'director',      // Руководитель предприятия (read-only)
  VIEWER: 'viewer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// What each role can do
export function canEdit(role: string) {
  return ['admin', 'pm', 'pto', 'mts'].includes(role);
}
export function canManageUsers(role: string) {
  return role === 'admin';
}
export function canViewAnalytics(role: string) {
  return true; // all roles
}
export function canExportTo1C(role: string) {
  return ['admin', 'pm', 'mts'].includes(role);
}

interface AuthState {
  user: CurrentUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: CurrentUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth(user, accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    // Simple cookie so middleware can check auth without reading localStorage
    document.cookie = `is_authenticated=1; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
    set({ user, accessToken, isLoading: false });
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    document.cookie = 'is_authenticated=; path=/; max-age=0';
    set({ user: null, accessToken: null, isLoading: false });
    window.location.href = '/login';
  },

  async loadFromStorage() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await apiClient.get<CurrentUser>('/users/me');
      set({ user: data, accessToken: token, isLoading: false });
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ isLoading: false });
    }
  },
}));
