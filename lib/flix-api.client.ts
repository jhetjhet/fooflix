import {
  FlixGenre,
  FlixMediaType,
  FlixResponse,
  FlixTypeMap,
  FlixUser,
} from "@/types/flix";
import typedFetch from "./typed-fetch";
import { FetchResponse } from "@/types";
import { WTUserEvent } from "@/types/watch-together";

export async function clientFetchFlixItems<T extends FlixMediaType>(
  type: T = "all" as T,
  params: Record<string, string> = {},
): Promise<FlixResponse<FlixTypeMap[T]>> {
  const searchParams = new URLSearchParams({
    ...params,
  });

  const response = await typedFetch<FetchResponse<FlixResponse<FlixTypeMap[T]>>>(
    `/flix/public/api/${type}?${searchParams}`,
  );

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status} - ${response.error}`);
  }

  return response.data;
}

export async function clientFetchFlixGenres(): Promise<FlixGenre[]> {
  const response = await typedFetch<FetchResponse<FlixGenre[]>>(
    `/flix/public/api/genre/list`,
  );

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status} - ${response.error}`);
  }

  return response.data;
}

export async function clientFetchFlixDetails<T extends keyof FlixTypeMap>({
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
  const url = `/flix/public/api/${type}/${id}?${searchParams}`;

  const response = await typedFetch<FetchResponse<FlixTypeMap[T]>>(url);

  if (!response.ok) {
    throw new Error(`Client Flix API error: ${response.status} - ${response.error}`);
  }

  return response.data;
}

export async function clientFetchFlixUsers(users: WTUserEvent[]): Promise<FlixUser[]> {
  const params = new URLSearchParams();

  users.forEach((u) => params.append("ids", u.userId));

  const response = await typedFetch<FetchResponse<FlixUser[]>>(`/flix/sess/auth/users/lookup/?${params.toString()}`);

  if (!response.ok) {
    console.error("Failed to fetch user details");
    return [];
  }

  return response.data;
}