import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { NextRequest } from 'next/server'; 

// Fungsi: GET (User melihat semua layanan/katalog atau detail satu layanan)
export async function GET(request: NextRequest) {
    try {
        // 1. Ambil ID dari query parameter (contoh: /api/services?id=...)
        const serviceId = request.nextUrl.searchParams.get('id');

        if (serviceId) {
            // 2. Jika ID ada, ambil detail satu layanan
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
            });

            if (!service) {
                return NextResponse.json({ message: 'Layanan tidak ditemukan' }, { status: 404 });
            }
            return NextResponse.json({ service: service });

        } else {
            // 3. Jika ID tidak ada, ambil semua layanan (katalog)
            const services = await prisma.service.findMany({ orderBy: { name: 'asc' } });
            return NextResponse.json({ services: services });
        }
        
    } catch (error) {
        console.error('API GET Service Error:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
    }
}