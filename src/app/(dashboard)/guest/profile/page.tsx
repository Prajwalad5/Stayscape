import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function GuestProfileRedirect() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  // Directly redirect to their public profile
  redirect(`/users/${(session.user as any).id}`);
}
