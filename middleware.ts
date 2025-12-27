import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Protect /admin route
    const token = request.cookies.get("auth_token");

    // Simple check: if token exists, we assume logged in for now.
    // Enhanced check: try to parse it. 
    // If it was the old simple string, it won't be valid JSON (unless it was quoted, but it wasn't).
    // The previous token was just "admin_logged_in_v2".

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
