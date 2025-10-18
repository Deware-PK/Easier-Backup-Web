import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

    // console.log('--- Middleware is running! Path:', request.nextUrl.pathname);

    const token = request.cookies.get("SESSION_TOKEN__DO_NOT_SHARE")?.value;
    const { pathname } = request.nextUrl;

    if (!token && pathname !== "/login") {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token && pathname === "/login") {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
};