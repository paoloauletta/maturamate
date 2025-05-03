import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";

// Define options for better cookie handling
const authOptions = {
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    httpOnly: true,
  },
};

export const GET = handleAuth(authOptions);
