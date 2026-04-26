import {
  FlixGenre,
  FlixMediaDiscSchema,
  FlixMediaType,
  FlixResponse,
  FlixTypeMap,
} from "@/types/flix";
import typedFetch from "./typed-fetch";
import { FetchResponse } from "@/types";

export async function clientFetchFlixItems<T extends FlixMediaType>(
  type: T = "all" as T,
  params: Record<string, string> = {},
): Promise<FlixResponse<FlixTypeMap[T]>> {
  const searchParams = new URLSearchParams({
    ...params,
  });

  const response = await typedFetch<FetchResponse<FlixResponse<FlixTypeMap[T]>>>(
    `/api/flix/${type}?${searchParams}`,
  );

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status} - ${response.error}`);
  }

  return response.data;
}

export async function clientFetchFlixGenres(): Promise<FlixGenre[]> {
  const response = await typedFetch<FetchResponse<FlixGenre[]>>(
    `/api/flix/genre/list`,
  );

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status} - ${response.error}`);
  }

  return response.data;
}