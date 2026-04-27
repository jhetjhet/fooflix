import { TMDBTypeMap } from "@/types/tmdb";

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: process.env.TMDB_API_KEY || "",
    ...params,
  });
  const url = `${process.env.TMDB_API_BASE}${endpoint}?${searchParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

export async function getTMDBDetails<T extends keyof TMDBTypeMap>({
  type,
  id,
  params = {},
}: {
  type: T;
  id: number;
  params?: Record<string, string>;
}): Promise<TMDBTypeMap[T]> {
  const data = await fetchTMDB<TMDBTypeMap[T]>(`/${type}/${id}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });

  return data;
}