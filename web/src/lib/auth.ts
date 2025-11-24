import { User } from '@/types';

// Key untuk Local Storage
const TOKEN_KEY = 'barberx_admin_token';
const USER_KEY = 'barberx_admin_user'; // Key untuk menyimpan data admin

/**
 * Menyimpan token dan data user ke Local Storage setelah login sukses.
 * Ini adalah fungsi utama setelah POST /login berhasil.
 * @param data - Objek respons dari API login ({ token, admin: User }).
 */
export function setAuthData(data: { token: string, admin: User }): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(TOKEN_KEY, data.token);
            // Menyimpan data user dalam format string JSON
            localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
        } catch (error) {
            console.error('Error saving auth data to Local Storage:', error);
        }
    }
}

/**
 * Mengambil token otentikasi dari Local Storage.
 * Digunakan untuk header 'Authorization'.
 * @returns Token JWT atau null jika tidak ada.
 */
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