export interface Service {
    id: string;
    name: string;
    description?: string | null; // Opsional
    price: number;
    duration: number;
    imageUrl?: string | null; // Opsional
    createdAt?: string;
    updatedAt?: string;
}

export interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    bookingTime: string; // ISO string
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    serviceId: string;
    createdAt?: string;
    updatedAt?: string;

    // PENTING: Ini harus ada agar tidak merah saat mengakses b.service.name
    service?: Service | null; 
}

export interface User {
    id: string;
    username: string;
    role: string;
}

// Tipe data untuk respons sukses dari API login
export interface AuthResponse {
    token: string;
    admin: User;
    message: string;
}

// Tipe dasar untuk respons yang hanya berisi pesan
export interface MessageResponse {
    message: string;
}