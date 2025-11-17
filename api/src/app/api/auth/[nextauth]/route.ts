import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Impor "buku aturan"

const handler = NextAuth(authOptions);

// NextAuth menangani GET dan POST
export { handler as GET, handler as POST };