// web/src/app/booking/page.tsx
import { API_URL } from '@/lib/api';
import { Service } from '@/types';
import BookingForm from '@/components/BookingForm';

// Fungsi untuk mengambil data layanan dari API
async function getServices(): Promise<Service[]> {
  try {
    // Pastikan API_URL sudah benar menunjuk ke http://localhost:3007/api
    const res = await fetch(`${API_URL}/services`, {
      cache: 'no-store', // Pastikan selalu mengambil data terbaru dari server
    });

    if (!res.ok) {
      // Jika respons tidak OK (misalnya 404, 500), coba baca body-nya untuk debug
      const errorBody = await res.text();
      console.error(`Failed to fetch services: ${res.status} ${res.statusText}, Body: ${errorBody}`);
      return []; // Kembalikan array kosong agar aplikasi tidak crash
    }

    // API Anda mengembalikan objek dengan properti 'services', jadi ambil itu
    const result: { services: Service[] } | unknown = await res.json(); // Gunakan 'unknown' untuk respons awal yang tidak pasti

    // Validasi runtime untuk memastikan 'services' ada dan merupakan array
    if (result && typeof result === 'object' && 'services' in result && Array.isArray(result.services)) {
      return result.services; // Kembalikan hanya array services
    } else {
      console.error('API did not return an object with a "services" array in expected format:', result);
      return []; // Jika format tidak sesuai
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    return []; // Kembalikan array kosong jika ada error jaringan atau parsing JSON
  }
}

// Komponen Server untuk halaman booking
export default async function BookingPage() {
  const services = await getServices();

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-center mb-14"></h1>
      {/* Tampilkan pesan jika tidak ada layanan, atau BookingForm jika ada */}
      {services.length === 0 ? (
        <p className="text-red-500 text-center">Unable to load service or no service available.</p>
      ) : (
        <BookingForm services={services} />
      )}
    </div>
  );
}