'use client';

import { useState } from 'react';
import AuthClientWrapper from '@/components/AuthClientWrapper';
import Image from 'next/image';
import { setAuthData } from '@/lib/auth'; 

const API_URL = "http://localhost:3007/api";

// DEFINISI TIPE DATA
interface AdminData {
    id: string;
    username: string;
    role: string;
}

interface LoginResponse {
    token: string;
    admin: AdminData;
}

const loginAdmin = async (username: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        // Pesan error diubah ke Bahasa Inggris untuk konsistensi UI
        const errorMessage = errorData.message || 'Invalid credentials.'; 
        throw new Error(errorMessage);
    }

    return res.json();
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * Menangani proses submit form login.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await loginAdmin(username, password);
      
      // Menyimpan data autentikasi ke local storage/cookie via helper
      setAuthData({
        token: response.token,
        admin: response.admin
      });
      
      setSuccess(`Login successful! Welcome, ${response.admin.username}.`);
      
      // Mengarahkan pengguna ke dashboard setelah jeda singkat
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 1000);

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'An error occurred during login.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthClientWrapper>
      {() => (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md">
            
            {/* Bagian Header dan Logo */}
            <div className="text-center mb-2">
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src="/images/LogoBarberX.png"
                  alt="Barber-X Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                BARBERX
              </h1>
            </div>

            {/* Kartu Login */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Admin Access</h2>
                <p className="text-gray-500 text-sm font-medium">Please enter your credentials to continue</p>
              </div>

              {/* Notifikasi Error */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center">
                   <span className="text-red-700 text-xs font-bold uppercase tracking-wide">{error}</span>
                </div>
              )}

              {/* Notifikasi Sukses */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center">
                   <span className="text-green-700 text-xs font-bold uppercase tracking-wide">{success}</span>
                </div>
              )}

              <form onSubmit={(e) => handleSubmit(e, { saveAuthToken })} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition duration-200"
                      placeholder="Masukkan username Anda"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password Field dengan Toggle */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"} // Toggle type
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition duration-200 pr-10"
                      placeholder="Masukkan password Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    {/* Toggle Password Button */}
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      {showPassword ? (
                        // Icon mata tertutup (slash) ketika password visible
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m9 9l-3-3m-3 3l3-3m0 0l3 3m-3-3l-3 3" />
                        </svg>
                      ) : (
                        // Icon mata terbuka ketika password hidden
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 text-white font-medium rounded-lg shadow transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Masuk ke Dashboard</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AuthClientWrapper>
  );
}