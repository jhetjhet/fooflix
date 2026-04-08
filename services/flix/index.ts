import { MediaItem, MediaType } from "@/types/tmdb";
import { FlixGenre, FlixMediaType, FlixMovie, FlixResponse, FlixSeries, FlixTypeMap } from "@/types/flix";

const FLIX_API_BASE = 'http://localhost:8000/api/';

export async function fetchFlixItems<T>(
  type: FlixMediaType = "all",
  params: Record<string, string> = {},
): Promise<FlixResponse<T>> {
  const searchParams = new URLSearchParams({
    // api_key: TMDB_API_KEY,
    ...params,
  });
  const url = `${FLIX_API_BASE}${type}?${searchParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status}`);
  }

  return response.json();
}

export async function fetchFlixDetails<T extends keyof FlixTypeMap>({
  type,
  id,
  params = {},
}: {
  type: T,
  id: string,
  params?: Record<string, string>,
}): Promise<FlixTypeMap[T]> {
  const searchParams = new URLSearchParams({
    ...params,
  });
  const url = `${FLIX_API_BASE}${type}/${id}?${searchParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status}`);
  }

  return response.json();
}

export function flixIsSeries(item: FlixMovie | FlixSeries): item is FlixSeries {
  return "seasons" in item;
}

export function flixToMediaItem(flix: FlixMovie | FlixSeries): MediaItem {
  let genreIds: number[] = [];
  let mediaType: MediaType = "movie";

  if (flixIsSeries(flix)) {
    mediaType = "tv";
  }
  
  return {
    id: parseInt(flix.tmdb_id),
    title: flix.title,
    posterPath: flix?.poster_path || null,
    backdropPath: null,
    overview: "",
    releaseDate: flix?.date_release || "",
    voteAverage: 0,
    mediaType: mediaType,
    genreIds: genreIds,
  }
}

export async function fetchFlixGenres(): Promise<FlixGenre[]> {
  const url = `${FLIX_API_BASE}genre/list/`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status}`);
  }

  return response.json() || [];
}

export function isFlixSeries(item: FlixMovie | FlixSeries): item is FlixSeries {
  return "seasons" in item;
}