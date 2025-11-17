import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session'; 

// Fungsi: GET (Admin melihat semua jadwal)
export async function GET(request: Request) {
  // Cek Login
    const session = await getAdminSession();
    if (!session) {
    return NextResponse.json({ message: 'Tidak Terautentikasi' }, { status: 401 });
    }

  // Jika aman, ambil data
    try {
    const bookings = await prisma.booking.findMany({
        orderBy: { bookingTime: 'asc' },
      include: { service: true }, // Sertakan data service terkait
    });
    return NextResponse.json({ bookings: bookings });
    } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
    }
}