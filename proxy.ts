import { JWTResponseSchema } from "@/types/flix";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import getCookieConfig from "./lib/cookie-config";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) return NextResponse.next();

  let parsedSession = null;

  try {
    parsedSession = JSON.parse(sessionCookie);
  } catch (error) {
    // Invalid JSON, clear the cookie
    const response = NextResponse.next();
    response.cookies.set("session", "", {
      ...getCookieConfig(),
      expires: new Date(0),
      maxAge: 0,
    });
    return response;
  }

  const session = JWTResponseSchema.safeParse(parsedSession);

  if (!session.success) {
    const response = NextResponse.next();
    response.cookies.set("session", "", {
      ...getCookieConfig(),
      expires: new Date(0),
      maxAge: 0,
    });
    return response;
  }

  // Check if token is expired
  if (Date.now() > session.data.access_expiration * 1000) {
    const res = await fetch(`${process.env.DJANGO_API_URL}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: session.data.refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      const updatedSession = {
        ...session.data,
        access: data.access,
        access_expiration: data.access_expiration,
      };

      const response = NextResponse.next();
      response.cookies.set("session", JSON.stringify(updatedSession), getCookieConfig());

      response.headers.set("x-refreshed-token", updatedSession.access);

      return response;
    } else {
      // Refresh token failed (expired or revoked)
      const response = NextResponse.next();
      response.cookies.set("session", "", {
        ...getCookieConfig(),
        expires: new Date(0),
        maxAge: 0,
      });
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