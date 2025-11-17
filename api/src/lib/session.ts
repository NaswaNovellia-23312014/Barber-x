import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

/**
 * Helper untuk mengambil sesi admin yang sedang login di server.
 * Ini akan gunakan ini untuk melindungi API Admin.
 */
export const getAdminSession = () => {
    return getServerSession(authOptions);
};