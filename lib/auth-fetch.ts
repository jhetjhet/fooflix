import { JWTResponse, JWTResponseSchema } from "@/types/flix";
import { cookies, headers } from "next/headers";

export async function authFetch(url: string, options: RequestInit = {}) {
  const allHeaders = await headers();
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  const sessionParse = sessionValue ? JSON.parse(sessionValue) : null;

  const jwtResult = JWTResponseSchema.safeParse(sessionParse);

  if (!jwtResult.success) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session: JWTResponse = jwtResult.data;

  const respHeaders = new Headers(options.headers);
  const authToken = allHeaders.get("x-refreshed-token") || session?.access;

  if (authToken) {
    respHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  return fetch(url, {
    ...options,
    headers: respHeaders,
  });
}
