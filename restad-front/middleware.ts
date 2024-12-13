import {NextRequest, NextResponse} from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    if (!token) {
        console.log('Unauthorized: No token found');
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)

    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/admin', '/admin/:path*', '/superadmin', '/superadmin/:path*'],
}