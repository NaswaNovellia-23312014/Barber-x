import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Impor "colokan" DB

// Fungsi: GET (User melihat semua layanan/katalog)
export async function GET(request: Request) {
    try {
    const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ services: services });
    } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
    }
}