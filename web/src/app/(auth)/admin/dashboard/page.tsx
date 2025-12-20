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

        {/* Tanggal */}
        <div className="border-t mt-6 pt-4">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* BAGIAN KARTU STATISTIK */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Bookings</p>
          <h3 className="text-4xl font-black mt-1">{stats.total}</h3>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-yellow-100 ring-2 ring-yellow-500/5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-yellow-600 text-[10px] font-black uppercase tracking-widest">Pending Approval</p>
          <h3 className="text-4xl font-black mt-1 text-yellow-600">{stats.pending}</h3>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-green-100 ring-2 ring-green-500/5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-green-600 text-[10px] font-black uppercase tracking-widest">Services Completed</p>
          <h3 className="text-4xl font-black mt-1 text-green-600">{stats.completed}</h3>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL KIRI: TABEL PEMESANAN */}
        <div className="lg:col-span-8 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveTab('ACTIVE')}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ACTIVE' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              Queue & Active ({bookings.filter(b => normalizeStatus(b.status) !== 'COMPLETED').length})
            </button>
            <button 
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'COMPLETED' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              Completed History ({stats.completed})
            </button>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Service & Schedule</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-20 text-gray-400 italic text-sm">
                        No bookings found in this section.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map(b => (
                      <tr key={b.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 rounded-l-2xl border-y border-l border-gray-100">
                          <div className="font-bold text-gray-900">{b.customerName}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                            <Phone className="w-3 h-3"/> {b.customerPhone}
                          </div>
                        </td>
                        <td className="px-4 py-4 border-y border-gray-100">
                          <div className="text-sm font-bold text-indigo-600">{b.service?.name || 'Service Deleted'}</div>
                          <div className="text-[10px] text-gray-400 mt-1 font-bold">
                            {new Date(b.bookingTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(b.bookingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-4 rounded-r-2xl border-y border-r border-gray-100 text-center">
                          <select 
                            value={normalizeStatus(b.status)}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className={`text-[10px] font-black px-3 py-2 rounded-full border-none ring-1 cursor-pointer outline-none transition-all
                              ${normalizeStatus(b.status) === 'CONFIRMED' ? 'ring-green-500 bg-green-50 text-green-700' : 
                                normalizeStatus(b.status) === 'PENDING' ? 'ring-yellow-500 bg-yellow-50 text-yellow-700' :
                                normalizeStatus(b.status) === 'COMPLETED' ? 'ring-blue-500 bg-blue-50 text-blue-700' : 
                                'ring-red-500 bg-red-50 text-red-700'}`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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