import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/middleware/verifyToken'; // Menggunakan JWT verify
import type { NextRequest } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


// Fungsi: GET (Admin mengambil semua Layanan) - CRUD: Read (List)
export async function GET(request: NextRequest) {
    const authResult = verifyToken(request); // PROTEKSI JWT
    if (authResult instanceof NextResponse) {
        return authResult;
    }
    
    try {
        const services = await prisma.service.findMany({ 
            orderBy: { name: 'asc' } 
        }); 

        return NextResponse.json({
            message: "Data Services berhasil diambil.",
            data: services
        }, { status: 200 });

    } catch (error) {
        console.error('API GET Service Error:', error);
        return new NextResponse('Gagal mengambil data Service.', { status: 500 });
    }
}

// Fungsi: POST (Admin membuat layanan baru) - CRUD: Create
export async function POST(request: NextRequest) {
    const authResult = verifyToken(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    let body;
    try {
        // PERHATIAN: Baris ini harus aman, pastikan Apidog mengirimkan data
        body = await request.json(); 
    } catch (e) {
        // Tangkap SyntaxError (misalnya JSON kosong atau tidak valid)
        console.error('Failed to parse request body:', e);
        return new NextResponse('Input data tidak valid atau kosong (Harus berupa JSON).', { status: 400 });
    }

    try {
        const { name, price, duration, description, imageUrl } = body;

        // Validasi Dasar
        if (!name || !price || !duration) {
            return new NextResponse('Nama, Harga, dan Durasi wajib diisi.', { status: 400 });
        }
        
        // ... (Logika Prisma di sini)
        const newService = await prisma.service.create({
            data: {
                name,
                price: parseInt(price), 
                duration: parseInt(duration),
                description,
                imageUrl,
            },
        });
        
        return NextResponse.json({ 
            message: 'Layanan berhasil dibuat',
            service: newService 
        }, { status: 201 });
        
    } catch (error) {
        console.error('API POST Service Error:', error);
        return new NextResponse('Gagal membuat layanan. Cek tipe data.', { status: 500 });
    }
}

// Fungsi: PUT (Admin meng-update layanan) - CRUD: Update
export async function PUT(request: NextRequest) {
    const authResult = verifyToken(request); // PROTEKSI JWT
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    // AMBIL ID DARI QUERY PARAMETER
    const serviceId = request.nextUrl.searchParams.get('id');
    if (!serviceId) {
        return new NextResponse('Service ID harus disediakan melalui query parameter (?id=...).', { status: 400 });
    }

    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new NextResponse('Input data tidak valid atau kosong (Harus berupa JSON).', { status: 400 });
    }

    try {
        const { name, price, duration, description, imageUrl } = body;

        // Tipe Record<string, unknown> untuk mengatasi linter 'any'
        const updateData: Record<string, unknown> = {}; 
        
        if (name) updateData.name = name;
        // PENTING: Cek price/duration sebelum parse
        if (price) updateData.price = parseInt(price); 
        if (duration) updateData.duration = parseInt(duration);
        if (description) updateData.description = description;
        if (imageUrl) updateData.imageUrl = imageUrl;
        
        const updatedService = await prisma.service.update({
            where: { id: serviceId },
            data: updateData,
        });

        return NextResponse.json({
            message: `Layanan ID ${serviceId} berhasil diupdate.`,
            service: updatedService
        }, { status: 200 });

    } catch (error) {
        console.error('API PUT Service Error:', error);
        // Error Prisma jika ID tidak ditemukan
        return new NextResponse('Gagal mengupdate Layanan. Pastikan ID valid di database.', { status: 500 });
    }
}

// Fungsi: DELETE (Admin menghapus layanan) - CRUD: Delete
export async function DELETE(request: NextRequest) {
    const authResult = verifyToken(request);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    const serviceId = request.nextUrl.searchParams.get('id');
    if (!serviceId) {
        return new NextResponse('Service ID harus disediakan (?id=...)', { status: 400 });
    }

    try {
        await prisma.service.delete({
            where: { id: serviceId },
        });

        return NextResponse.json(
            { message: `Layanan ID ${serviceId} berhasil dihapus.` },
            { status: 200 }
        );

    } catch (error: unknown) {
        console.error('API DELETE Service Error:', error);

        // ✔ CEK ERROR PRISMA DENGAN BENAR
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return new NextResponse('Layanan tidak ditemukan.', { status: 404 });
            }
        }

        return new NextResponse(
            'Gagal menghapus Layanan. Mungkin masih terhubung ke Booking.',
            { status: 500 }
        );
    }
}