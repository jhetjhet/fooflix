import { isJWTResponse } from "@/services/flix";
import { JWTResponse } from "@/types/flix";
import { cookies, headers } from "next/headers";

export async function flixFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const allHeaders = await headers();
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  const sessionParse = sessionValue ? JSON.parse(sessionValue) : null;

  if(!isJWTResponse(sessionParse)) {
    throw new Error("Invalid session data");
  }

  const session: JWTResponse = sessionParse;

  const respHeaders = new Headers(options.headers);
  const authToken = allHeaders.get("x-refreshed-token") || session?.access;

  if (authToken) {
    respHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${process.env.DJANGO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      ...Object.fromEntries(respHeaders.entries()),
    },
    cache: "no-store", // Ensure we don't cache API responses
  });

  return response.json();
}