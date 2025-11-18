import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // <-- Import JWT

// Secret key dari environment variable
const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET;

// HANYA MENGIZINKAN METHOD POST
export async function POST(request: Request) {
    // 1. Dapatkan data JSON dari request
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return new NextResponse('Username dan Password harus diisi.', { status: 400 });
        }

        // 2. Cek Admin di Database
        const admin = await prisma.admin.findUnique({
            where: { username },
        });

        if (!admin) {
            return new NextResponse('Kredensial tidak valid.', { status: 401 });
        }

        // 3. Cek Password
        const isPasswordValid = await compare(password, admin.password);

        if (!isPasswordValid) {
            return new NextResponse('Kredensial tidak valid.', { status: 401 });
        }
        
        // --- 4. BUAT JSON WEB TOKEN (JWT) ---
        if (!jwtSecret) {
            // Cek jika secret key tidak terdefinisi
            return new NextResponse('JWT Secret tidak terdefinisi.', { status: 500 });
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
        return NextResponse.json(
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

    } catch (error) {
        console.error('API Login Error:', error);
        return new NextResponse('Terjadi kesalahan internal server.', { status: 500 });
    }
}