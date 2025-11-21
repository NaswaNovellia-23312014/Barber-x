
// Membersihkan nilai input agar HANYA mengandung mengandung huruf (a-z, A-Z)
export const filterNama = (value: string): string => {
    return value.replace(/[^a-zA-Z]/g, '');
};

// Membersihkan nilai input agar HANYA mengandung angka (0-9).
export const filterNomor = (value: string): string => {
    // Regex: \D menghapus semua karakter non-digit.
    return value.replace(/[^0-9]/g, '');
};