import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server'; 

// Secret key dari environment variable
const jwtSecret = process.env.JWT_SECRET;

// Helper function to set CORS headers
const setCorsHeaders = (response: NextResponse | Response) => {
    // Izinkan semua origin untuk pengembangan. 
    response.headers.set('Access-Control-Allow-Origin', '*'); 
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Izinkan POST dan OPTIONS
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Content-Type diperlukan untuk body JSON
    response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight request
    return response;
};

// Handle OPTIONS request for CORS preflight (WAJIB ditambahkan)
export async function OPTIONS() {
    // 204 No Content adalah status standar untuk permintaan preflight yang berhasil
    const response = new NextResponse(null, { status: 204 }); 
    return setCorsHeaders(response);
}

// FUNGSI: POST (Login Admin)
export async function POST(request: Request) {
    let response: NextResponse | undefined;
    
    try {
        // 1. Dapatkan data JSON dari request
        const { username, password } = await request.json();

        if (!username || !password) {
            response = new NextResponse('Username dan Password harus diisi.', { status: 400 });
            return setCorsHeaders(response); // Tambahkan header CORS
        }

        // 2. Cek Admin di Database
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            response = new NextResponse('Kredensial tidak valid.', { status: 401 });
            return setCorsHeaders(response); // Tambahkan header CORS
        }

        // 3. Cek Password
        const isPasswordValid = await compare(password, admin.password);

        if (!isPasswordValid) {
            response = new NextResponse('Kredensial tidak valid.', { status: 401 });
            return setCorsHeaders(response); // Tambahkan header CORS
        }
        
        //  4. BUAT JSON WEB TOKEN (JWT)
        if (!jwtSecret) {
            // Cek jika secret key tidak terdefinisi
            response = new NextResponse('JWT Secret tidak terdefinisi.', { status: 500 });
            return setCorsHeaders(response); // Tambahkan header CORS
        }

        // Data yang disimpan di dalam token (payload)
        const tokenPayload = { 
            id: admin.id, 
            username: admin.username,
            role: 'admin', // Tambahkan role untuk keperluan otorisasi
        };

        // Buat token, kadaluarsa dalam 7 hari
        const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: '7d' });

        // 5. Kirim Respons Sukses (200 OK)
        response = NextResponse.json(
            { 
                message: 'Login sukses',
                token: token, // Kirim token kembali ke client
                admin: {
                    id: admin.id,
                    username: admin.username,
                }
            },
            { status: 200 }
        );
        return setCorsHeaders(response); 

    } catch (error) {
        console.error('API POST Login Error:', error);
        // Pastikan respons error juga memiliki header CORS
        response = NextResponse.json({ message: 'Terjadi kesalahan server saat login.' }, { status: 500 });
        return setCorsHeaders(response);
    }
}