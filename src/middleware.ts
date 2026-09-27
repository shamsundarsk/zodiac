import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin pages (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('zodiac_session');
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const token = sessionCookie.value;
      const parts = token.split('.');
      if (parts.length !== 3) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadRaw);

      if (payload.role !== 'ADMIN' || (payload.exp && payload.exp < Math.floor(Date.now() / 1000))) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (err) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
