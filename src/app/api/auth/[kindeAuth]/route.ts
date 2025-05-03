import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Define options for better cookie handling
const authOptions = {
  cookieOptions: {
    secure: true, // Always use secure cookies - especially on Vercel
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    httpOnly: true,
    domain: process.env.VERCEL_URL ? `.${process.env.VERCEL_URL}` : undefined,
  },
};

export const GET = handleAuth(authOptions);
