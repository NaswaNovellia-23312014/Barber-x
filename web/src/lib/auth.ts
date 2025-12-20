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
    if (typeof window !== 'undefined') {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Error reading token from Local Storage:', error);
            return null;
        }
    }
    return null;
}

/**
 * MENGATASI ERROR: Mengambil data user admin dari Local Storage.
 * Digunakan untuk menampilkan informasi user di Dashboard.
 * @returns Objek User atau null jika tidak ada.
 */
export function getAdminUser(): User | null {
    if (typeof window !== 'undefined') {
        try {
            const userJson = localStorage.getItem(USER_KEY);
            if (userJson) {
                // Parse string JSON kembali menjadi objek User
                return JSON.parse(userJson) as User;
            }
            return null;
        } catch (error) {
            console.error('Error reading user data from Local Storage:', error);
            // Hapus semua data otentikasi jika gagal parsing (data rusak)
            removeAuthData(); 
            return null;
        }
    }
    return null;
}

/**
 * MENGATASI ERROR: Menghapus semua data otentikasi (token dan user) dari Local Storage.
 * Ini adalah fungsi utama untuk Logout.
 */
export function removeAuthData(): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
        } catch (error) {
            console.error('Error removing auth data from Local Storage:', error);
        }
    }
}

/**
 * Mengecek status otentikasi dasar (apakah token dan user ada).
 */
export function checkAuthStatus(): boolean {
    const token = getAuthToken();
    const user = getAdminUser();
    // Harus ada token DAN data user
    return !!token && !!user; 
}