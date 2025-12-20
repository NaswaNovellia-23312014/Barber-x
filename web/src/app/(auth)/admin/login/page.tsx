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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Input Username */}
                <div className="space-y-1.5">
                  <label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold transition-all"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold transition-all"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-4 flex items-center text-[10px] font-black uppercase text-gray-400 hover:text-black transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Tombol Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? "Processing..." : "Login to Dashboard"}
                </button>
              </form>
            </div>
            
            <p className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              &copy; 2025 BarberX Management System
            </p>
          </div>
        </div>
      )}
    </AuthClientWrapper>
  );
}