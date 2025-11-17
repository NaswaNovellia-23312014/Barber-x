import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/session'; // Panggil "Satpam"

// Fungsi: PUT (Admin meng-update layanan)
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
    const body = await request.json();
    const { name, price, duration, description, imageUrl } = body;

    const updatedService = await prisma.service.update({
        where: { id: params.id },
        data: {
        name,
        price: parseInt(price),
        duration: parseInt(duration),
        description,
        imageUrl,
        },
    });
    return NextResponse.json({ service: updatedService });
    } catch (error) {
    return NextResponse.json({ message: 'Gagal update layanan' }, { status: 500 });
    }
}

