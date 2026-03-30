import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/login';
  const isAdminRoute = pathname.startsWith('/dashboard/admin');

  // Sin token: redirigir al login (excepto si ya está en login)
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Con token en login: redirigir al dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Rutas admin: verificar que rol_id === '1'
  if (token && isAdminRoute) {
    const rolId = request.cookies.get('rol_id')?.value;
    if (rolId !== '1') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
