"use server";

import { FlixMediaType, FlixResponse, FlixTypeMap, FlixUser, FlixUserSchema } from "@/types/flix";
import typedFetch from "./typed-fetch";
import { authFetch } from "./auth-fetch";

export async function getFlixApiBase() {
  return process.env.DJANGO_API_URL;
}

export async function flixFetch(
  endpoint: string, 
  options: RequestInit = {},
) {
  return authFetch(`${await getFlixApiBase()}${endpoint}`, {
    ...options,
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
  const url = `${await getFlixApiBase()}/api/${type}?${searchParams}`;

  return typedFetch<FlixResponse<FlixTypeMap[T]>>(url);
}

export async function fetchFlixDetails<T extends keyof FlixTypeMap>({
  type,
  id,
  params = {},
}: {
  type: T;
  id: string;
  params?: Record<string, string>;
}): Promise<FlixTypeMap[T]> {
  const searchParams = new URLSearchParams({
    ...params,
  });
  const url = `${await getFlixApiBase()}/api/${type}/${id}?${searchParams}`;

  const response = await typedFetch<FlixTypeMap[T]>(url);

  return response;
}