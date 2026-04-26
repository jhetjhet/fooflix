import { MediaItem, MediaType } from "@/types/tmdb";
import {
  FlixGenre,
  FlixMediaType,
  FlixMovie,
  FlixMovieSchema,
  FlixResponse,
  FlixSeries,
  FlixSeriesSchema,
  FlixTypeMap,
  FlixUser,
} from "@/types/flix";
import { WTUserEvent } from "@/types/watch-together";
import { FetchResponse } from "@/types";
import typedFetch from "@/lib/typed-fetch";

const FLIX_API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL;

export const DEFAULT_FLIX_MOVIE: FlixMovie = {
  type: "movie",
  id: "",
  title: "",
  tmdb_id: "",
  poster_path: null,
  date_release: null,
  date_upload: "",
  genres: [],
  extension: "",
  has_video: false,
  video_path: "",
  video_url: "",
  subtitles: [],
};

export const DEFAULT_FLIX_SERIES: FlixSeries = {
  type: "series",
  seasons: [],
  id: "",
  title: "",
  tmdb_id: "",
  poster_path: null,
  date_release: null,
  date_upload: "",
  genres: [],
};

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
  type: T;
  id: string;
  params?: Record<string, string>;
}): Promise<FlixTypeMap[T]> {
  const searchParams = new URLSearchParams({
    ...params,
  });
  const url = `${FLIX_API_BASE}${type}/${id}?${searchParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status}`);
  }

  const responseData = await response.json();

  return responseData;
}

export async function fetchFlixMovie(id: string): Promise<FlixMovie> {
  const data = await fetchFlixDetails({ type: "movie", id });

  const dataRes = FlixMovieSchema.safeParse(data);

  if (!dataRes.success) {
    throw new Error("Invalid Flix movie data");
  }

  return dataRes.data;
}

export async function fetchFlixSeries(id: string): Promise<FlixSeries> {
  const data = await fetchFlixDetails({ type: "series", id });

  const dataRes = FlixSeriesSchema.safeParse(data);

  if (!dataRes.success) {
    throw new Error("Invalid Flix series data");
  }

  return dataRes.data;
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
  };
}

export async function fetchFlixGenres(): Promise<FlixGenre[]> {
  const url = `${FLIX_API_BASE}genre/list/`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Flix API error: ${response.status}`);
  }

  return response.json() || [];
}

export async function fetchUsers(users: WTUserEvent[]): Promise<FlixUser[]> {
  const params = new URLSearchParams();

  users.forEach((u) => params.append("ids", u.userId));

  const response = await typedFetch<FetchResponse<FlixUser[]>>(`/api/users?${params.toString()}`);

  if (!response.ok) {
    console.error("Failed to fetch user details");
    return [];
  }

  return response.data;
}