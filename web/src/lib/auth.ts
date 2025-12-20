import { User } from '@/types';

// Pastikan dua kunci ini unik dan sama di semua file
const TOKEN_KEY = 'barberx_token_v1'; 
const ADMIN_KEY = 'barberx_admin_v1';

interface AuthData {
  token: string;
  admin: User; // Kita gunakan label 'admin'
}

export function setAuthData(data: AuthData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAdminUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
}
export function checkAuthStatus(): boolean {
    const token = getAuthToken();
    const user = getAdminUser();
    // Harus ada token DAN data user
    return !!token && !!user; 
}