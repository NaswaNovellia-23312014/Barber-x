// api/prisma/seed.ts

import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding...`);

    // Pastikan Admin dan bcryptjs sudah siap
    if (!hash) {
        console.error('Pastikan paket bcryptjs sudah terinstal.');
        process.exit(1);
    }


  // SEED ADMIN USER
    const password = await hash('adminbarberx', 12); 
    
  // Hapus semua Admin untuk memastikan hanya ada satu saat seeding
    await prisma.admin.deleteMany(); 

    const admin = await prisma.admin.create({
        data: {
            username: 'admin',
            password: password,
        },
    });
    console.log(`Admin pertama berhasil dibuat: ${admin.username}`);

  // SEED SERVICE DATA (Data yang dibutuhkan Form Booking)
    const servicesData = [
    {
        name: 'Haircut & Wash',
        description: 'Layanan potong rambut dasar, termasuk keramas dan styling.',
        price: 50000,
        duration: 45, // Durasi dalam menit
    },
    {
        name: 'Beard Trim',
        description: 'Perapian dan pembentukan janggut/kumis.',
        price: 30000,
        duration: 30,
    },
    {
        name: 'Hair Treatment (Creambath)',
        description: 'Perawatan rambut mendalam dengan creambath.',
        price: 75000,
        duration: 60,
    },
    ];

    for (const service of servicesData) {
        await prisma.service.upsert({
            where: { name: service.name },
            update: service, // Jika sudah ada, update datanya
            create: service, // Jika belum ada, buat baru
        });
    }

    console.log(`Seeding finished. Total ${servicesData.length} services ditambahkan.`);
    }

    // JALANKAN FUNGSI DAN TUTUP KONEKSI
    main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect(); // Menggunakan $disconnect
    });