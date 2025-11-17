import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session'; // Panggil "Satpam"

// Fungsi: PUT (Admin meng-update status booking)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
  // Cek Login
    const session = await getAdminSession();
    if (!session) {
    return NextResponse.json({ message: 'Tidak Terautentikasi' }, { status: 401 });
    }

  // Jika aman, jalankan logika
    try {
    // Admin hanya akan mengirim status baru, misal: { "status": "CONFIRMED" }
    const body = await request.json(); 
    const { status } = body; 

    const updatedBooking = await prisma.booking.update({
        where: { id: params.id },
        data: {
        status: status,
        },
    });
    return NextResponse.json({ booking: updatedBooking });
    } catch (error) {
    return NextResponse.json({ message: 'Gagal update booking' }, { status: 500 });
    }
}

// Fungsi: DELETE (Admin menghapus/membatalkan booking)
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
  // Cek Login
    const session = await getAdminSession();
    if (!session) {
    return NextResponse.json({ message: 'Tidak Terautentikasi' }, { status: 401 });
    }

  // Jika aman, jalankan logika
    try {
    await prisma.booking.delete({
        where: { id: params.id },
    });
    return NextResponse.json({ message: 'Booking berhasil dihapus' }, { status: 200 });
    } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus booking' }, { status: 500 });
    }
}