// middleware.ts
import { JWTResponse } from "@/types/flix";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) return NextResponse.next();

  const session = JSON.parse(sessionCookie) as JWTResponse;

  // Check if token is expired
  if (Date.now() > session.access_expiration * 1000) {
    const res = await fetch(`${process.env.DJANGO_API_URL}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedSession = {
        ...session,
        access: data.access,
        access_expiration: data.access_expiration,
      };

      const response = NextResponse.next();
      response.cookies.set("session", JSON.stringify(updatedSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      response.headers.set("x-refreshed-token", updatedSession.access);

      return response;
    } else {
      // Refresh token failed (expired or revoked)
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};