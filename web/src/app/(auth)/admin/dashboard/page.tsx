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
  Calendar as CalendarIcon,
  MessageCircle,
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
import { formatWhatsAppLink } from '@/lib/input-helpers';

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
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans pb-20">
    
    {/* Background Decoration */}
    <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-50/40 to-slate-50/0" />
    </div>
      
      {/* BAGIAN HEADER DASHBOARD */}
      <header className="max-w-7xl mx-auto mb-10 px-4 pt-6"> {/* Ditambah pt-6 agar tidak mepet atas */}
        
        {/* Container Header diberi Background Putih & Shadow agar "Pop-out" */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-sm rounded-3xl p-6 md:p-8">
            
            {/* Baris Utama */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-5">
                {/* Logo dengan Shadow Halus */}
                <div className="drop-shadow-md">
                    <Image
                    src="/images/LogoBarberX.png"
                    alt="Barber-X Logo"
                    width={64}
                    height={64}
                    className="object-contain"
                    priority
                    />
                </div>

                {/* Teks */}
                <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight leading-none text-slate-900">
                    BARBER-X <span className="text-indigo-600">ADMIN</span>
                </h1>
                <p className="text-slate-500 text-sm font-medium mt-1">
                    Welcome back,{" "}
                    <span className="font-bold text-slate-800">
                    {user?.username}
                    </span>
                </p>
                </div>
            </div>

            {/* Kanan: Tombol Aksi */}
            <div className="flex gap-3">
                <button
                onClick={() => {
                    setIsRefreshing(true);
                    loadData(false);
                }}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                title="Refresh Data"
                >
                <RefreshCw
                    className={`w-5 h-5 ${
                    isRefreshing ? "animate-spin text-indigo-600" : ""
                    }`}
                />
                </button>

                <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm active:scale-95"
                >
                <LogOut className="w-4 h-4" />
                Logout
                </button>
            </div>
            </div>

            {/* Tanggal - Desain Divider yang lebih rapi */}
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    })}
                </span>
            </div>

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

        {/* PANEL KANAN: MANAJEMEN LAYANAN (SERVICES) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-[10px] uppercase tracking-widest text-gray-400">Services</h2>
              <button 
                onClick={() => { 
                  setEditingServiceId(null); 
                  setServiceFormData({name:'', price:0, duration:0, description:''}); 
                  setIsModalOpen(true); 
                }} 
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="p-4 border border-gray-50 rounded-2xl flex justify-between items-center group hover:border-indigo-100 transition">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{s.name}</p>
                    <p className="text-[10px] text-indigo-600 font-black tracking-tight">{formatCurrency(s.price)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingServiceId(s.id); setServiceFormData({...s, description: s.description || ''}); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Pencil className="w-4 h-4"/></button>
                    <button onClick={async () => { if(confirm('Delete service?')) { await deleteService(s.id); loadData(false); }}} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / UBAH LAYANAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 text-center">{editingServiceId ? 'Update Service' : 'New Service'}</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if(editingServiceId) await updateService(editingServiceId, serviceFormData);
                else await createService(serviceFormData);
                setIsModalOpen(false);
                loadData(false);
              } catch (err) { alert(err instanceof Error ? err.message : "Save failed"); }
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-1 block">Service Name</label>
                <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-1 block">Price (IDR)</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={serviceFormData.price} onChange={e => setServiceFormData({...serviceFormData, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 mb-1 block">Duration (Mins)</label>
                  <input required type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold" value={serviceFormData.duration} onChange={e => setServiceFormData({...serviceFormData, duration: Number(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}