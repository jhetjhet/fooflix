"use server";

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
    return new Response("Unauthorized", { status: 401 });
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

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch user:", responseData);
      return null;
    }

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