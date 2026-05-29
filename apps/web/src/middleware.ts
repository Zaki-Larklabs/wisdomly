import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('wisdomly_token')?.value;
  const role = request.cookies.get('wisdomly_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. If accessing a protected dashboard route
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      // Not logged in -> Redirect immediately to login
      const url = new URL('/login', request.url);
      return NextResponse.redirect(url);
    }

    // Role-based route protection at the edge
    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/dashboard/teacher') && role !== 'TEACHER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/dashboard/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // 2. Redirect logged-in users away from auth pages
  if (pathname === '/login' && token && role) {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    }
    if (role === 'TEACHER') {
      return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
    }
    if (role === 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
