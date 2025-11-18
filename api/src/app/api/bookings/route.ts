import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fungsi: POST (User membuat booking baru)
export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new NextResponse('Input data tidak valid atau kosong (Harus berupa JSON).', { status: 400 });
    }

    try {
        const { customerName, customerPhone, bookingTime, serviceId } = body;

        // Validasi Dasar
        if (!customerName || !customerPhone || !bookingTime || !serviceId) {
            return NextResponse.json({ message: 'Data tidak lengkap (Nama, HP, Waktu, dan Service wajib diisi).' }, { status: 400 });
        }

        // AMBIL DURASI LAYANAN & Cek Eksistensi Service
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { duration: true, name: true } // Ambil durasi dan nama
        });

        if (!service) {
            return NextResponse.json({ message: 'Service ID tidak valid atau Layanan tidak ditemukan.' }, { status: 404 });
        }

        // HITUNG JENDELA WAKTU (SLOT BARU) 
        const newStartTime = new Date(bookingTime);
        const durationMs = service.duration * 60 * 1000; // Durasi dalam milidetik
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        // Validasi Sederhana: Waktu tidak boleh di masa lalu
        if (newStartTime.getTime() < Date.now()) {
            return NextResponse.json({ message: 'Waktu booking tidak boleh di masa lalu.' }, { status: 400 });
        }


        // Cari semua booking yang statusnya PENDING atau CONFIRMED DAN dimulai
        // atau berakhir dalam jangka waktu yang berpotensi bentrok
        const potentialConflicts = await prisma.booking.findMany({
            where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
                // Filter awal untuk mengurangi hasil (ambil booking yang mulai 
                // sebelum waktu selesai slot baru)
                bookingTime: {
                    lt: newEndTime, 
                }
            },
            // HARUS menggunakan include service agar durasi booking yang sudah ada bisa dihitung
            include: {
                service: { select: { duration: true } } 
            }
        });
        
        // Loop untuk mengecek bentrokan yang sebenarnya (karena durasi berbeda-beda)
        for (const conflict of potentialConflicts) {
            const existingStartTime = conflict.bookingTime;
            const existingDurationMs = conflict.service.duration * 60 * 1000;
            const existingEndTime = new Date(existingStartTime.getTime() + existingDurationMs);

            // Kondisi Overlap: 
            // Existing Start Time < New End Time 
            // DAN Existing End Time > New Start Time
            if (
                existingStartTime.getTime() < newEndTime.getTime() &&
                existingEndTime.getTime() > newStartTime.getTime()
            ) {
                // BENTROK DITEMUKAN
                return NextResponse.json({ 
                    message: `Slot booking jam ${newStartTime.toLocaleTimeString('id-ID')} (${service.name}) bentrok dengan booking yang sudah ada.`,
                    conflictTime: existingStartTime.toISOString(),
                }, { status: 409 }); // Kode 409 Conflict
            }
        }
        
        // BUAT BOOKING (Jika Lolos Validasi) ---
        const newBooking = await prisma.booking.create({
            data: {
                customerName,
                customerPhone,
                bookingTime: newStartTime, // Gunakan objek Date yang sudah divalidasi
                serviceId,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ 
            message: 'Booking berhasil dibuat.',
            booking: newBooking 
        }, { status: 201 });

    } catch (error) {
        console.error('API POST Booking Error:', error);
        return NextResponse.json({ message: 'Gagal membuat booking. Cek serviceId atau format waktu.' }, { status: 500 });
    }
}