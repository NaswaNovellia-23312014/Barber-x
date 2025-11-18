import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/middleware/verifyToken';

export async function GET(request: Request) {
    // 1. Panggil Middleware
    const authResult = verifyToken(request);

    // 2. Jika Middleware mengembalikan Response (gagal/error), segera kirim respons tersebut
    if (authResult instanceof NextResponse) {
        return authResult; // Mengembalikan 401, 403, atau 500
    }
    
    // 3. Jika Middleware mengembalikan Payload (berhasil), lanjutkan eksekusi
    // Kita bisa mengambil data user dari authResult (e.g., authResult.username)
    
    // Simulasikan data admin yang seharusnya hanya bisa dilihat oleh admin
    return NextResponse.json({ 
        message: "Akses Berhasil! Ini adalah data sensitif.",
        user: authResult.username, 
        role: authResult.role 
    }, { status: 200 });
}