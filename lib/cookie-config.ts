import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";


export default function getCookieConfig() {
    const cookieOptions: Partial<ResponseCookie> = {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || "604800"), // Default to 7 days
    }

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "none";
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }
    
    return cookieOptions;
}