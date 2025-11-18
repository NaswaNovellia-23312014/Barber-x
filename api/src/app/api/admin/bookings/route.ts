import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/middleware/verifyToken';
import type { NextRequest } from 'next/server';

// Fungsi: GET (Mengambil semua data Booking)
export async function GET(request: NextRequest) {
    const authResult = verifyToken(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }
    
    try {
        const bookings = await prisma.booking.findMany(); 

        return NextResponse.json({
            message: "Data Bookings berhasil diambil.",
            data: bookings
        }, { status: 200 });

    } catch (error) {
        console.error('API GET Booking Error:', error);
        return new NextResponse('Gagal mengambil data Booking.', { status: 500 });
    }
}

// Fungsi: PUT (Update Booking menggunakan Query Parameter ID)
export async function PUT(request: NextRequest) {
    const authResult = verifyToken(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    // --- CARA BARU MENGAMBIL ID DARI QUERY PARAMETER ---
    const bookingId = request.nextUrl.searchParams.get('id');

    if (!bookingId) {
        return new NextResponse('Booking ID harus disediakan melalui query parameter (?id=...).', { status: 400 });
    }

    try {
        const data = await request.json();

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: data,
        });

        return NextResponse.json({
            message: `Booking ID ${bookingId} berhasil diupdate.`,
            booking: updatedBooking
        }, { status: 200 });

    } catch (error) {
        console.error('API PUT Booking Error:', error);
        return new NextResponse('Gagal mengupdate Booking. Pastikan ID valid di database.', { status: 500 });
    }
}

// Fungsi: DELETE (Hapus Booking menggunakan Query Parameter ID)
export async function DELETE(request: NextRequest) {
    const authResult = verifyToken(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    // --- CARA BARU MENGAMBIL ID DARI QUERY PARAMETER ---
    const bookingId = request.nextUrl.searchParams.get('id');

    if (!bookingId) {
        return new NextResponse('Booking ID harus disediakan melalui query parameter (?id=...).', { status: 400 });
    }

    try {
        await prisma.booking.delete({
            where: { id: bookingId },
        });

        return NextResponse.json({
            message: `Booking ID ${bookingId} berhasil dihapus.`
        }, { status: 200 }); 

    } catch (error) {
        console.error('API DELETE Booking Error:', error);
        return new NextResponse('Gagal menghapus Booking. Pastikan ID valid.', { status: 500 });
    }
}