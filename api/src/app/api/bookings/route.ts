// web/src/app/api/bookings/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server';

// =================================================================
// HELPER DAN CORS HANDLER
// =================================================================

// Helper function to set CORS headers (Penting untuk mengatasi error CORS)
const setCorsHeaders = (response: NextResponse | Response) => {
    // Izinkan semua origin untuk pengembangan. 
    // Untuk produksi, ganti '*' dengan origin spesifik Anda (misal: 'http://localhost:3000')
    response.headers.set('Access-Control-Allow-Origin', '*'); 
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Izinkan metode yang digunakan
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight request
    return response;
};

// Handle OPTIONS request for CORS preflight (Diperlukan oleh browser)
export async function OPTIONS() {
    // 204 No Content adalah status standar untuk permintaan preflight yang berhasil
    const response = new NextResponse(null, { status: 204 }); 
    return setCorsHeaders(response);
}

// =================================================================
// FUNGSI: GET (Mengambil booking berdasarkan tanggal)
// =================================================================
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // Mengambil parameter 'date' dari URL: /api/bookings?date=2025-11-24
        const dateParam = searchParams.get('date'); 

        let bookings;

        if (dateParam) {
            const startDate = new Date(dateParam);
            
            if (isNaN(startDate.getTime())) {
                const errorResponse = NextResponse.json({ message: 'Format tanggal tidak valid.' }, { status: 400 });
                return setCorsHeaders(errorResponse);
            }
            
            // Hitung akhir hari (24 jam dari awal tanggal)
            const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); 

            // Filter booking untuk tanggal yang diminta
            bookings = await prisma.booking.findMany({
                where: {
                    bookingTime: {
                        gte: startDate, // Greater than or equal to (Mulai dari jam 00:00 tanggal X)
                        lt: endDate,    // Less than (Sebelum jam 00:00 tanggal X+1)
                    },
                },
                select: {
                    id: true,
                    customerName: true,
                    customerPhone: true,
                    bookingTime: true,
                    serviceId: true,
                    status: true,
                },
                orderBy: {
                    bookingTime: 'asc',
                },
            });
        } else {
            // Jika tidak ada tanggal, kembalikan daftar booking terbaru atau semua
            bookings = await prisma.booking.findMany({
                orderBy: {
                    bookingTime: 'desc',
                },
                take: 50,
            });
        }

        const successResponse = NextResponse.json(bookings, { status: 200 });
        return setCorsHeaders(successResponse); // Terapkan CORS

    } catch (error) {
        console.error('API GET Booking Error:', error);
        const errorResponse = NextResponse.json({ message: 'Gagal mengambil daftar booking.' }, { status: 500 });
        return setCorsHeaders(errorResponse); // Terapkan CORS
    }
}

// =================================================================
// FUNGSI: POST (User membuat booking baru)
// =================================================================
export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        const errorResponse = new NextResponse('Input data tidak valid atau kosong (Harus berupa JSON).', { status: 400 });
        return setCorsHeaders(errorResponse);
    }

    try {
        const { customerName, customerPhone, bookingTime, serviceId } = body;

        // Validasi Dasar
        if (!customerName || !customerPhone || !bookingTime || !serviceId) {
            const errorResponse = NextResponse.json({ message: 'Data tidak lengkap (Nama, HP, Waktu, dan Service wajib diisi).' }, { status: 400 });
            return setCorsHeaders(errorResponse);
        }

        // 1. Ambil Durasi Layanan & Cek Eksistensi Service
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { duration: true, name: true }
        });

        if (!service) {
            const errorResponse = NextResponse.json({ message: 'Service ID tidak valid atau Layanan tidak ditemukan.' }, { status: 404 });
            return setCorsHeaders(errorResponse);
        }

        // 2. Hitung Jendela Waktu Booking Baru
        const newStartTime = new Date(bookingTime);
        const durationMs = service.duration * 60 * 1000;
        const newEndTime = new Date(newStartTime.getTime() + durationMs);

        // Validasi: Waktu tidak boleh di masa lalu
        if (newStartTime.getTime() < Date.now()) {
            const errorResponse = NextResponse.json({ message: 'Waktu booking tidak boleh di masa lalu.' }, { status: 400 });
            return setCorsHeaders(errorResponse);
        }


        // 3. Deteksi Bentrokan
        const potentialConflicts = await prisma.booking.findMany({
            where: {
                status: { in: ['PENDING', 'CONFIRMED'] },
                // Filter awal: hanya ambil booking yang START time-nya terjadi sebelum END time slot baru
                bookingTime: {
                    lt: newEndTime, 
                }
            },
            include: {
                service: { select: { duration: true } } 
            }
        });
        
        for (const conflict of potentialConflicts) {
            const existingStartTime = conflict.bookingTime;
            const existingDurationMs = conflict.service.duration * 60 * 1000;
            const existingEndTime = new Date(existingStartTime.getTime() + existingDurationMs);

            // Kondisi Overlap: [Existing Start < New End] AND [Existing End > New Start]
            if (
                existingStartTime.getTime() < newEndTime.getTime() &&
                existingEndTime.getTime() > newStartTime.getTime()
            ) {
                // BENTROK DITEMUKAN (Code 409 Conflict)
                const conflictResponse = NextResponse.json({ 
                    message: `Slot booking jam ${newStartTime.toLocaleTimeString('id-ID')} (${service.name}) bentrok dengan booking yang sudah ada.`,
                    conflictTime: existingStartTime.toISOString(),
                }, { status: 409 });
                return setCorsHeaders(conflictResponse);
            }
        }
        
        // 4. Buat Booking Baru (Jika Lolos Validasi)
        const newBooking = await prisma.booking.create({
            data: {
                customerName,
                customerPhone,
                bookingTime: newStartTime,
                serviceId,
                status: 'PENDING',
            },
        });

        const successResponse = NextResponse.json({ 
            message: 'Booking berhasil dibuat.',
            booking: newBooking 
        }, { status: 201 });
        return setCorsHeaders(successResponse);

    } catch (error) {
        console.error('API POST Booking Error:', error);
        const errorResponse = NextResponse.json({ message: 'Gagal membuat booking. Cek serviceId, format waktu, atau koneksi DB.' }, { status: 500 });
        return setCorsHeaders(errorResponse);
    }
}