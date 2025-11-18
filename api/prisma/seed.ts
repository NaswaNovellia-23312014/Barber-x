import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcryptjs';

    // Inisialisasi Prisma Client
    const prisma = new PrismaClient();

    async function main() {
    // BUAT PASSWORD AMAN
    const password = await hash('admin123', 12); 

    // HAPUS ADMIN LAMA (OPSIONAL)
    await prisma.admin.deleteMany(); 

    // BUAT ADMIN BARU
    const admin = await prisma.admin.create({
        data: {
        username: 'admin', // Username untuk login
        password: password,  // Password yang sudah di-hash
        },
    });

    console.log(`Admin pertama berhasil dibuat: ${admin.username}`);
    }

    // JALANKAN FUNGSI DAN TUTUP KONEKSI
    main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });