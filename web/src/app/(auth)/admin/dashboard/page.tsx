'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  Plus, 
  Pencil, 
  Trash2, 
  Phone,
  Calendar as CalendarIcon
} from 'lucide-react';

import { Booking, Service, User } from '@/types';
import { getAdminUser, removeAuthData } from '@/lib/auth';
import { 
    getAdminBookings, 
    getAdminServices, 
    updateBookingStatus, 
    deleteService,
    createService,
    updateService
} from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  
  // State untuk kontrol UI dan Modal
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState({
      name: '', price: 0, duration: 0, description: ''
  });

  /**
   * Menormalisasi format status dari backend untuk memastikan konsistensi logika frontend.
   */
  const normalizeStatus = (status: string | undefined | null): string => {
    if (!status) return '';
    const s = String(status).toUpperCase().trim();
    if (s === 'SELESAI' || s === 'SUCCESS' || s === 'DONE') return 'COMPLETED';
    return s;
  };

  /**
   * Menghitung statistik pemesanan secara real-time untuk ditampilkan pada kartu informasi.
   */
  const stats = useMemo(() => {
    const s = { total: 0, pending: 0, completed: 0 };
    bookings.forEach(b => {
      const status = normalizeStatus(b.status);
      s.total++;
      if (status === 'PENDING') s.pending++;
      if (status === 'COMPLETED') s.completed++;
    });
    return s;
  }, [bookings]);

  /**
   * Menyaring data pemesanan yang ditampilkan berdasarkan tab aktif (Antrean dan Riwayat).
   */
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const currentStatus = normalizeStatus(b.status);
      if (activeTab === 'ACTIVE') {
        return currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED';
      }
      return currentStatus === 'COMPLETED';
    });
  }, [bookings, activeTab]);

  /**
   * Mengambil data pemesanan dan layanan dari server secara paralel.
   * Melakukan validasi token; jika tidak valid, pengguna diarahkan ke halaman login.
   */
  const loadData = useCallback(async (showFullLoading = true) => {
    if (showFullLoading) setIsLoading(true);
    try {
        const currentUser = getAdminUser();
        if (!currentUser) throw new Error('NO_TOKEN');
        setUser(currentUser);

        const [bookingsData, servicesData] = await Promise.all([
            getAdminBookings(),
            getAdminServices()
        ]);
        
        setBookings(bookingsData || []);
        setServices(servicesData || []);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('TOKEN') || errorMessage.includes('UNAUTHORIZED')) {
             removeAuthData(); 
             router.replace('/admin/login');
        }
    } finally {
        setIsLoading(false);
        setIsRefreshing(false);
    }
  }, [router]);

  /**
   * Menjalankan inisialisasi data dan menetapkan interval polling setiap 30 detik
   * untuk memastikan data dashboard (real-time).
   */
  useEffect(() => {
    loadData(true);
    const interval = setInterval(() => {
        loadData(false);
    }, 30000); 
    return () => clearInterval(interval);
  }, [loadData]);

  /**
   * Memperbarui status pemesanan dengan pendekatan 'Optimistic Update'
   * untuk meningkatkan pengalaman pengguna (responsivitas instan).
   */
  const handleStatusChange = async (id: string, newStatus: string) => {
    const originalBookings = [...bookings];
    
    // 1. Perbarui UI secara instan
    setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status: newStatus as Booking['status'] } : b
    ));

    try {
        // 2. Kirim permintaan pembaruan ke backend
        await updateBookingStatus(id, { status: newStatus as Booking['status'] });
        
        // 3. Jika status selesai, otomatis pindahkan fokus ke tab Riwayat
        if (normalizeStatus(newStatus) === 'COMPLETED') {
            setActiveTab('COMPLETED');
        }
    } catch (err) {
        // Kembalikan data ke kondisi awal jika API gagal
        setBookings(originalBookings);
        alert(err instanceof Error ? err.message : "Update failed"); 
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      removeAuthData();
      router.replace('/admin/login');
    }
  };

  // Tampilan indikator pemuatan data awal
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
      <RefreshCw className="w-8 h-8 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-gray-900">
      
      {/* BAGIAN HEADER DASHBOARD */}
      <header className="max-w-7xl mx-auto mb-10 px-4">
        {/* Baris Utama */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Image
              src="/images/LogoBarberX.png"
              alt="Barber-X Logo"
              width={72}
              height={72}
              className="object-contain"
              priority
            />

            {/* Teks */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter leading-tight">
                BARBER-X ADMIN
              </h1>
              <p className="text-gray-500 text-sm italic">
                Welcome back,{" "}
                <span className="font-bold text-indigo-600">
                  {user?.username}
                </span>
              </p>
            </div>
          </div>

          {/* Kanan: Tombol Aksi */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadData(false);
              }}
              className="p-2.5 bg-white border rounded-xl hover:bg-gray-50 transition shadow-sm active:scale-95"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition border border-red-100 shadow-sm active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Dashboard Admin
            </h2>
            
            {/* Stats Cards dengan Filter */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bookings</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-500 mt-2">+5 from last week</p>
                <button
                  onClick={() => handleStatsFilter('all')}
                  className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                >
                  View All
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500 mt-2">Need confirmation</p>
                <button
                  onClick={() => handleStatsFilter('pending')}
                  className="mt-2 text-yellow-500 hover:text-yellow-700 text-sm"
                >
                  View Pending
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500 mt-2">This month</p>
                <button
                  onClick={() => handleStatsFilter('completed')}
                  className="mt-2 text-green-500 hover:text-green-700 text-sm"
                >
                  View Completed
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">
                  Rp {revenue.toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-500 mt-2">This month</p>
                <button
                  onClick={handleReports}
                  className="mt-2 text-purple-500 hover:text-purple-700 text-sm"
                >
                  View Report
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={handleManageBookings}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Manage Bookings
                </button>
                
                <button 
                  onClick={handleViewServices}
                  className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  View Services
                </button>
                
                <button 
                  onClick={handleCustomerData}
                  className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Customer Data
                </button>
                
                <button 
                  onClick={handleReports}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition duration-200 flex flex-col items-center justify-center"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>New booking from John Doe</span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>Service &quot;Haircut&quot; updated</span>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span>New customer registered</span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}