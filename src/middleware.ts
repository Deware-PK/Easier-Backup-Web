import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("SESSION_TOKEN__DO_NOT_SHARE")?.value;
    const expiresAtStr = request.cookies.get("SESSION_EXPIRES_AT")?.value;
    const { pathname } = request.nextUrl;

    if (token && pathname !== '/recovery-codes') {
        const now = Date.now();
        const expiresAt = expiresAtStr ? Number(expiresAtStr) : NaN;

        if (!Number.isFinite(expiresAt) || now > expiresAt) {
            const res = NextResponse.redirect(new URL('/login', request.url));
            res.cookies.delete("SESSION_TOKEN__DO_NOT_SHARE");
            res.cookies.delete("SESSION_EXPIRES_AT");
            return res;
        }
    }

    const publicRoutes = ['/login', '/register', '/forgot-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (pathname === '/recovery-codes') {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }


    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && isPublicRoute) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
};