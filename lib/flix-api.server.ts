"use server";

import { FlixMediaType, FlixMovie, FlixResponse, FlixSeries, FlixTypeMap, FlixUser, FlixUserSchema, JWTResponse, JWTResponseSchema } from "@/types/flix";
import { cookies, headers } from "next/headers";
import typedFetch from "./typed-fetch";

const FLIX_API_BASE = `${process.env.DJANGO_API_URL}/api/`;

export async function flixFetch(
  endpoint: string, 
  options: RequestInit = {},
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

  return fetch(`${process.env.DJANGO_API_URL}${endpoint}`, {
    ...options,
    headers: respHeaders,
  });
}

export async function fetchFlixUser(): Promise<FlixUser | null> {
  try {
    const response = await flixFetch("/auth/users/me/");

    if (!response.ok) {
      console.error("Failed to fetch user:", await response.text());
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
    return null;
  }
};

export async function fetchFlixItems<T extends FlixMediaType>(
  type: T = "all" as T,
  params: Record<string, string> = {},
): Promise<FlixResponse<FlixTypeMap[T]>> {
  const searchParams = new URLSearchParams({
    ...params,
  });
  const url = `${FLIX_API_BASE}${type}?${searchParams}`;

  return typedFetch<FlixResponse<FlixTypeMap[T]>>(url);
}