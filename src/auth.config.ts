import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, headers } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const hostname = headers.get('host');
      const adminDomain = process.env.ADMIN_PORTAL_URL ? new URL(process.env.ADMIN_PORTAL_URL).host : 'admin.localhost:3000';

      const user = auth?.user as any;
      console.log("[AUTHORIZED] user:", JSON.stringify(user));
console.log("AUTHORIZED CHECK: user=", JSON.stringify(user));

      // Admin portal routes (via domain or rewritten path)
      if (hostname === adminDomain || pathname.startsWith('/admin-portal')) {
        // Allow public admin routes like login
        if (pathname === '/login' || pathname === '/admin-portal/login') return true;
        
        // Block if not logged in or not an admin
        if (!isLoggedIn) return false;
        if (user?.role !== 'ADMIN' && !user?.adminRole) return false;
        
        return true;
      }

      // Legacy admin routes (redirect to new portal in the future, for now protect them)
      if (pathname.startsWith('/admin')) {
        return isLoggedIn && (user?.role === 'ADMIN' || !!user?.adminRole);
      }

      // Host routes
      if (pathname.startsWith('/host')) {
        if (!isLoggedIn) return false;
        if (pathname === '/host/get-started') return true;
        return user?.role === 'HOST' || user?.role === 'ADMIN' || user?.isHost === true;
      }

      // Protected guest routes
      const protectedPaths = ['/guest', '/messages', '/book'];
      if (protectedPaths.some(p => pathname.startsWith(p))) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isHost = (user as any).isHost;
        token.adminRole = (user as any).adminRole;
        token.permissions = (user as any).permissions;
      }
      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
        token.role = session.role;
        token.isHost = session.isHost;
        if (session.adminRole !== undefined) token.adminRole = session.adminRole;
        if (session.permissions !== undefined) token.permissions = session.permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isHost = token.isHost;
        (session.user as any).adminRole = token.adminRole;
        (session.user as any).permissions = token.permissions;
        if (token.name) (session.user as any).name = token.name;
        if (token.picture) (session.user as any).image = token.picture;
      }
      return session;
    },
  },
};
