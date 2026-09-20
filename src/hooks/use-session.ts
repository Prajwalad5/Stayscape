'use client';

import { useSession as useNextAuthSession } from 'next-auth/react';

export function useCurrentUser() {
  const { data: session, status, update } = useNextAuthSession();
  
  return {
    user: session?.user as any,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    update,
  };
}

export function useIsHost() {
  const { user } = useCurrentUser();
  return user?.role === 'HOST' || user?.role === 'ADMIN';
}

export function useIsAdmin() {
  const { user } = useCurrentUser();
  return user?.role === 'ADMIN';
}
