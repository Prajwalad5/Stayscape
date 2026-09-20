import { hashEmailForSearch } from '@/lib/crypto';
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';
import { loginSchema } from '@/lib/validators/auth';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials);
        if (!validated.success) return null;

        const user = await prisma.user.findFirst({
          where: { 
            OR: [
              { email: validated.data.email },
              { emailSearchHash: hashEmailForSearch(validated.data.email) },
              { loginId: validated.data.email }
            ],
            deletedAt: null 
          },
        });

        if (!user || !user.passwordHash) return null;

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error('Account is temporarily locked. Try again later.');
        }

        const passwordMatch = await bcrypt.compare(validated.data.password, user.passwordHash);

        if (!passwordMatch) {
          // Increment login attempts
          const attempts = user.loginAttempts + 1;
          const updateData: any = { loginAttempts: attempts };
          
          // Lock after 5 failed attempts for 15 minutes
          if (attempts >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            updateData.loginAttempts = 0;
          }
          
          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
          
          return null;
        }

        // Reset login attempts on success
        if (user.loginAttempts > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          isHost: user.isHost,
          adminRole: user.adminRole,
          permissions: user.permissions,
        };
      },
    }),
  ],
});
