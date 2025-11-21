
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fungsi fetcher dasar untuk memanggil API (Mendukung GET, POST, PUT, DELETE)
export const fetcher = async (path: string, options?: RequestInit) => {
    if (!API_URL) {
        throw new Error('NEXT_PUBLIC_API_URL is not defined in .env.local');
    }

    const response = await fetch(`${API_URL}${path}`, options);

    // Jika response tidak OK (status code 4xx atau 5xx), throw error dengan data JSON dari API
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan saat memanggil API.');
    }

    // Jika responsnya 204 No Content (biasanya untuk DELETE atau PUT yang tidak mengembalikan body),
    if (response.status === 204) {
        return { message: 'Operasi berhasil.' };
    }

    // Untuk respons OK yang memiliki body (misal: GET, POST, PUT), parse sebagai JSON
    return response.json();
    };