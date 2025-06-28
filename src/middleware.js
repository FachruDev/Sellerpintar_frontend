import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Definisikan public routes yang ga perlu autentikasi
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Kalo mencoba akses route yang ga perlu autentikasi tanpa token, redirect ke login
  if (!token && !isPublicRoute && pathname !== '/') {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Kalo mencoba akses login/register dengan token, redirect ke dashboard
  if (token && isPublicRoute) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Konfigurasi route mana yang middleware harus jalankan
export const config = {
  matcher: [
    // Terapkan ke semua route kecuali static files, api routes, dan _next
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 