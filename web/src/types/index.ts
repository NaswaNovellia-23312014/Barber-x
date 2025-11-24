export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number; // Durasi layanan dalam menit
}

export interface Booking {
    id: string;
    customerName: string;
    customerPhone: string;
    bookingTime: string; // ISO string (misal "2023-12-25T14:00:00.000Z")
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'; // Status booking
    serviceId: string;
    // createdAt?: string; 
}

export interface User {
    id: string;
    username: string;
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