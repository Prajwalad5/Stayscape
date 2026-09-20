import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

const { auth: nextAuthMiddleware } = NextAuth(authConfig);

export default async function middleware(req: any, event: any) {
  // First, run auth middleware which populates req.auth
  const res = await nextAuthMiddleware(req, event) as any;
  
  if (res && res.status !== 200 && res.status !== 304 && res.headers.get('Location')) {
    // If auth middleware generated a redirect (e.g. to /login), let it happen
    return res;
  }

  const url = req.nextUrl.clone();
  const hostname = req.headers.get('host');

  const adminDomain = process.env.ADMIN_PORTAL_URL 
    ? new URL(process.env.ADMIN_PORTAL_URL).host 
    : 'admin.localhost:3000';

  // Multi-tenant routing: if accessing via admin domain, rewrite to /admin-portal
  if (hostname === adminDomain) {
    if (!url.pathname.startsWith('/admin-portal')) {
      url.pathname = `/admin-portal${url.pathname === '/' ? '/dashboard' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Optionally, you can leave this out to allow testing on localhost:3000/admin-portal
  // if (hostname !== adminDomain && url.pathname.startsWith('/admin-portal')) {
  //   url.pathname = '/404';
  //   return NextResponse.rewrite(url);
  // }

  return res || NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|uploads|images|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
