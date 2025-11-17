import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fungsi: POST (User membuat booking baru)
export async function POST(request: Request) {
    try {
    const body = await request.json();
    const { customerName, customerPhone, bookingTime, serviceId } = body;

    if (!customerName || !customerPhone || !bookingTime || !serviceId) {
        return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // TODO: Tambahkan validasi pengecekan slot tumpang tindih (overlap) di sini

    const newBooking = await prisma.booking.create({
        data: {
        customerName,
        customerPhone,
        bookingTime: new Date(bookingTime),
        serviceId,
        status: 'PENDING', // Status awal
        },
    });

    // Kirim kembali data booking yang baru dibuat
    return NextResponse.json({ booking: newBooking }, { status: 201 });
    } catch (error) {
    return NextResponse.json({ message: 'Gagal membuat booking' }, { status: 500 });
    }
}