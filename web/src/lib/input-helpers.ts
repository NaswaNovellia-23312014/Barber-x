
// Membersihkan nilai input agar HANYA mengandung mengandung huruf (a-z, A-Z)
export const filterNama = (value: string): string => {
    return value.replace(/[^a-zA-Z ]/g, '');
};

// Membersihkan nilai input agar HANYA mengandung angka (0-9).
export const filterNomor = (value: string): string => {
    // Ambil angka saja
    let cleaned = value.replace(/\D/g, '');
    
    // Jika user ketik '0' di awal, kita hapus (opsional, agar sinkron dengan prefix +62)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // POTONG strings agar MAKSIMAL 13 karakter saja
    return cleaned.slice(0, 13); 
};

export const formatWhatsAppLink = (phone: string, name: string) => {
    if (!phone) return "#";

    // Pastikan nomor bersih dari karakter aneh
    let cleanNumber = phone.replace(/\D/g, '');

    // Pastikan berawalan 62
    if (cleanNumber.startsWith('0')) {
        cleanNumber = '62' + cleanNumber.substring(1);
    } else if (!cleanNumber.startsWith('62')) {
        // Jika inputnya '812...', tambahkan '62' di depannya
        cleanNumber = '62' + cleanNumber;
    }

    // Pesan otomatis
    const message = `Halo Kak ${name}, kami dari Barber-X ingin mengonfirmasi jadwal booking Anda.`;

    // Gabungkan jadi link (Jangan ada return lain sebelum baris ini)
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};