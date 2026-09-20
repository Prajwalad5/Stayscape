import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as any;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireHost() {
  const user = await requireAuth();
  if (user.role !== 'HOST' && user.role !== 'ADMIN') {
    redirect('/');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    redirect('/');
  }
  return user;
}

export async function getFullUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isHost: true,
      bio: true,
      phone: true,
      stripeCustomerId: true,
      stripeAccountId: true,
      stripeOnboardingDone: true,
      createdAt: true,
    },
  });
}
