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
  Download
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

  //Fungsi Export CSV
  const handleExportCSV = () => {
  // 1. Buat Header Kolom
  const headers = [
    "Customer Name",
    "Phone Number", 
    "Service Name", 
    "Price",
    "Date", 
    "Time", 
    "Status"
  ];

  // 2. Ubah data booking menjadi baris CSV
  const rows = filteredBookings.map(b => {
    const date = new Date(b.bookingTime).toLocaleDateString('en-US');
    const time = new Date(b.bookingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Kita pakai tanda kutip "..." untuk menangani nama yang mungkin mengandung koma
    // Tanda petik satu ' pada no HP agar Excel membacanya sebagai teks (bukan angka ilmiah)
    return [
      `"${b.customerName}"`,
      `"'${b.customerPhone}"`, 
      `"${b.service?.name || 'Hapus'}"`,
      `"${b.service?.price}"`,
      `"${date}"`,
      `"${time}"`,
      `"${b.status}"`
    ].join(",");
  });

  // 3. Gabungkan Header dan Baris
  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows].join("\n");

  // 4. Buat Link Download Palsu & Klik Secara Otomatis
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `BarberX_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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
      {/* Container Statistik ditarik ke atas (negative margin) agar menumpuk header */}
      <div className="relative z-20 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 -mt-6 px-4">
        
        {/* Card 1: Total - Aksen Biru */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border-t-4 border-t-indigo-500 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Bookings</p>
          <h3 className="text-4xl font-black mt-1 text-slate-800">{stats.total}</h3>
        </div>

        {/* Card 2: Pending - Aksen Kuning */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border-t-4 border-t-amber-500 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-amber-600/80 text-[10px] font-black uppercase tracking-widest">Pending Approval</p>
          <h3 className="text-4xl font-black mt-1 text-amber-600">{stats.pending}</h3>
        </div>

        {/* Card 3: Completed - Aksen Hijau */}
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border-t-4 border-t-emerald-500 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform duration-300">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-emerald-600/80 text-[10px] font-black uppercase tracking-widest">Services Completed</p>
          <h3 className="text-4xl font-black mt-1 text-emerald-600">{stats.completed}</h3>
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
        <tr key={b.id} className="group bg-white hover:bg-slate-50/80 transition-all duration-300">

        {/* KOLOM CUSTOMER: Lebih Bersih & Professional */}
        <td className="px-6 py-5 rounded-l-[24px] border-y border-l border-slate-100">
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-base tracking-tight group-hover:text-indigo-600 transition-colors">
              {b.customerName}
            </span>
            
            <div className="flex flex-col gap-2 mt-2">
              {/* Badge WhatsApp Premium */}
              <a 
                href={formatWhatsAppLink(b.customerPhone, b.customerName)}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-fit px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white hover:scale-105 transition-all active:scale-95 border border-emerald-100"
              >
                <MessageCircle size={12} className="opacity-80" />
                Chat Customer
              </a>
              
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold ml-1">
                <Phone size={10} className="text-slate-300" />
                {b.customerPhone.replace(/\D/g, '').slice(0, 13)}
              </div>
            </div>
          </div>
        </td>

        {/* KOLOM SERVICE: Modern Schedule Layout */}
        <td className="px-6 py-5 border-y border-slate-100">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold w-fit">
              {b.service?.name || 'Service Deleted'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">
            <CalendarIcon size={12} />
            
            {/* TANGGAL: Mon, Jan 12 */}
            {new Date(b.bookingTime).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
            
            <span className="text-slate-300 mx-1">|</span>
            
            {/* JAM: 05:00 PM */}
            {new Date(b.bookingTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
          </div>
        </td>

        {/* KOLOM STATUS: Custom Select Design */}
        <td className="px-6 py-5 rounded-r-[24px] border-y border-r border-slate-100 text-center">
          <div className="relative inline-block w-full max-w-[140px]">
            <select 
              value={normalizeStatus(b.status)}
              onChange={(e) => handleStatusChange(b.id, e.target.value)}
              className={`appearance-none w-full text-[10px] font-black px-4 py-2.5 rounded-xl border-none ring-1 ring-inset cursor-pointer outline-none transition-all text-center
                ${normalizeStatus(b.status) === 'CONFIRMED' ? 'ring-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' : 
                  normalizeStatus(b.status) === 'PENDING' ? 'ring-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' :
                  normalizeStatus(b.status) === 'COMPLETED' ? 'ring-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 
                  'ring-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </td>
      </tr>
    )))}
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