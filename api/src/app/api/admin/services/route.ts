import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session'; // Panggil "Satpam"

// Fungsi: POST (Admin membuat layanan baru)
export async function POST(request: Request) {
  // Cek Login
    const session = await getAdminSession();
    if (!session) {
    return NextResponse.json({ message: 'Tidak Terautentikasi' }, { status: 401 });
    }

  // Jika aman, jalankan logika
    try {
    const body = await request.json();
    const { name, price, duration, description, imageUrl } = body;

    const newService = await prisma.service.create({
        data: {
        name,
        price: parseInt(price),
        duration: parseInt(duration),
        description,
        imageUrl,
        },
    });
    return NextResponse.json({ service: newService }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Gagal membuat layanan' }, { status: 500 });
    }
}