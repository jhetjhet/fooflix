import { FlixUser, FlixUserSchema, JWTResponse, JWTResponseSchema } from "@/types/flix";
import { cookies, headers } from "next/headers";

export async function flixFetch(
  endpoint: string, 
  options: RequestInit = {},
  baseUrl: string = process.env.DJANGO_API_URL || ""
) {
  const allHeaders = await headers();
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;
  const sessionParse = sessionValue ? JSON.parse(sessionValue) : null;

  const jwtResult = JWTResponseSchema.safeParse(sessionParse);

  if(!jwtResult.success) {
    throw new Error("Invalid session data");
  }

  const session: JWTResponse = jwtResult.data;

  const respHeaders = new Headers(options.headers);
  const authToken = allHeaders.get("x-refreshed-token") || session?.access;

  if (authToken) {
    respHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  return fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: respHeaders,
  });
}

export async function fetchFlixUser(): Promise<FlixUser | null> {
  try {
    const response = await flixFetch("/auth/users/me/");

    if (!response.ok) {
      console.error(`Failed to fetch user: ${response.status}`);
      return null;
    }

    const responseData = await response.json();

    const userResult = FlixUserSchema.safeParse(responseData);

    if (!userResult.success) {
      console.error("Invalid user data:", userResult.error);
      return null;
    }
    
    return userResult.data;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
};