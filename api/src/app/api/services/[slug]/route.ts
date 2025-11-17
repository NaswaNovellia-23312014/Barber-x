import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Fungsi: GET (User melihat detail satu layanan)
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
    const service = await prisma.service.findUnique({
        where: { id: params.id },
    });

    if (!service) {
        return NextResponse.json({ message: 'Layanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ service: service });
    } catch (error) {
        return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
    }
}