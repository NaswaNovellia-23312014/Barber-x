import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Secret key dari environment variable
const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET;

// Interface untuk Payload Token (tipe data yang disimpan di token)
interface TokenPayload {
    id: string;
    username: string;
    role: string;
    exp: number; // Expiration time
    iat: number; // Issued at time
}

// Fungsi Middleware untuk melindungi rute API
export function verifyToken(request: Request) {
    if (!jwtSecret) {
        return NextResponse.json({ message: 'JWT Secret tidak terdefinisi.' }, { status: 500 });
    }

    // 1. Ambil Token dari Header 'Authorization'
    const authorizationHeader = request.headers.get('Authorization');
    
    // Format yang diharapkan: "Bearer <token>"
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return NextResponse.json({ message: 'Akses Ditolak: Token tidak ditemukan.' }, { status: 401 });
    }

    // Ambil string token-nya saja
    const token = authorizationHeader.substring(7);

    try {
        // 2. Verifikasi Token
        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
        
        // 3. Tambahkan data user ke header request untuk digunakan di rute API
        // Catatan: Ini adalah simulasi penambahan data user. 
        // Di Next.js App Router, ini lebih sulit, jadi kita akan memprosesnya langsung.
        
        console.log(`Akses diberikan untuk user: ${decoded.username}`);
        
        // Mengembalikan payload yang sudah diverifikasi jika berhasil
        return decoded; 

    } catch (error) {
        // Jika token tidak valid, kadaluarsa, atau salah
        return NextResponse.json({ message: 'Akses Ditolak: Token tidak valid atau kadaluarsa.' }, { status: 403 });
    }
}