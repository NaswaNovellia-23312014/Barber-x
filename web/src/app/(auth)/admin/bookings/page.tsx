'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    Clock, 
    CheckCircle2, 
    History, 
    User as UserIcon, 
    Settings2,
    AlertCircle
} from 'lucide-react';

// Definisi tipe data untuk memastikan konsistensi objek dan menghindari tipe 'any'
interface Service {
    id: string;
    name: string;
    price: number;
}

interface Booking {
    id: string;
    customerName: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    service: Service | null;
}

export default function BookingPage() {
    // Inisialisasi state untuk manajemen tab, data pemesanan, dan indikator pemuatan (loading)
    const [activeTab, setActiveTab] = useState<'antrean' | 'riwayat'>('antrean');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fungsi untuk mengambil data pemesanan dari API berdasarkan kategori tab yang dipilih
    const fetchBookings = useCallback(async () => {
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
            console.error("Token autentikasi tidak ditemukan. Silakan melakukan login kembali.");
            return;
        }

        setIsLoading(true);
        try {
            // Melakukan permintaan data ke backend pada port 3007 dengan filter kategori
            const res = await fetch(`http://localhost:3007/api/admin/bookings?tab=${activeTab}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await res.json();
            setBookings(result.data || []);
        } catch (err) {
            console.error("Terjadi kesalahan saat mengambil data dari server:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    // Fungsi untuk memperbarui status pemesanan (misalnya: konfirmasi atau penyelesaian layanan)
    const handleUpdateStatus = async (id: string, newStatus: string) => {
        const token = localStorage.getItem('admin_token');
        
        try {
            // Menggunakan metode PUT dan menyertakan ID melalui query parameter sesuai spesifikasi backend
            const res = await fetch(`http://localhost:3007/api/admin/bookings?id=${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Melakukan pembaruan data secara otomatis setelah status berhasil diperbarui di database
                fetchBookings();
            }
        } catch (err) {
            alert("Gagal memperbarui status. Silakan periksa koneksi internet atau status server Anda.");
        }
    };

    // Menjalankan pengambilan data setiap kali terdapat perubahan pada dependensi fetchBookings
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <div className="p-6 max-w-7xl mx-auto font-sans">
            {/* Bagian judul dan informasi halaman */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Booking Management</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage and monitor your customer service queue.</p>
                </div>
                
                {/* Navigasi untuk berpindah antara antrean aktif dan riwayat pemesanan */}
                <div className="flex p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
                    <button 
                        onClick={() => setActiveTab('antrean')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'antrean' 
                            ? 'bg-white shadow-md text-indigo-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <Clock className="w-4 h-4" /> Active Queue
                    </button>
                    <button 
                        onClick={() => setActiveTab('riwayat')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'riwayat' 
                            ? 'bg-white shadow-md text-indigo-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <History className="w-4 h-4" /> History
                    </button>
                </div>
            </div>

            {/* Kontainer utama tabel informasi pemesanan */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-32 text-center text-gray-400 font-bold italic animate-pulse">
                        Synchronizing data...
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Detail</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-gray-900">{booking.customerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-semibold text-gray-700">
                                            {booking.service?.name || <span className="text-red-400 italic">Service Removed</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                                                booking.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                booking.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                booking.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {/* Logika kondisional untuk menampilkan tombol aksi hanya pada antrean aktif */}
                                            {activeTab === 'antrean' ? (
                                                <div className="flex justify-end gap-2">
                                                    {booking.status === 'PENDING' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                                                            className="text-[10px] font-black uppercase bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 transition"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" /> Complete
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center justify-end gap-2">
                                                    <Settings2 className="w-3 h-3" /> Archived
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Tampilan placeholder apabila data tidak ditemukan pada kategori terkait */
                    <div className="p-32 text-center flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold italic">
                            No records found in {activeTab === 'antrean' ? 'active queue' : 'history'}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}