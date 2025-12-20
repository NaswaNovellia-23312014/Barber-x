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

  // Handle untuk reports
  const handleReports = () => {
    console.log('Generating reports...');
    // Simulasi generate report
    alert('Report generation feature coming soon!');
  };

  // Handle untuk quick stats filter
  const handleStatsFilter = (filter: string) => {
    console.log(`Filtering by: ${filter}`);
    // Implement filter logic here
    alert(`Filtering bookings by: ${filter}`);
  };

  // Handle untuk refresh data
  const handleRefreshData = async () => {
    setLoading(true);
    try {
      // Simulasi refresh data
      console.log('Refreshing dashboard data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update stats dengan data baru (simulasi)
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      }));
      
      alert('Dashboard data refreshed!');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      alert('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('barberx_admin_token');
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                BARBER<span className="text-red-600">X</span> Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {admin?.username}</span>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
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