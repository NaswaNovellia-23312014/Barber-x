import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const admin = await prisma.admin.findUnique({
            where: { username: credentials.username },
        });

        if (!admin) return null;

        // Bandingkan password yang diinput dengan yang di-hash di DB
        const isPasswordValid = await compare(credentials.password, admin.password);

        if (!isPasswordValid) return null;

        // Jika berhasil, kembalikan data admin
        return { id: admin.id, username: admin.username };
        },
    }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.NEXTAUTH_SECRET,
};