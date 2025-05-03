import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Define public routes that don't require authentication
const publicRoutes = ["/", "/api/auth"];

// Define routes that require authentication
const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Completely skip middleware for auth callbacks to prevent interference
  if (
    pathname.includes("kinde_callback") ||
    pathname.includes("auth/register") ||
    pathname.includes("auth/login")
  ) {
    return NextResponse.next();
  }

  // Skip middleware for public paths and API routes that handle their own auth
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    (pathname.startsWith("/api") && !pathname.startsWith("/api/auth"))
  ) {
    return NextResponse.next();
  }

  // Check if the user is authenticated
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // If accessing protected routes without auth, redirect to homepage
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Continue for authenticated users or non-protected routes
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public image files)
     * - fonts/ (public font files)
     * - api/auth/* (auth routes that handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
    "/:path((?!api/auth).*)",
  ],
};
