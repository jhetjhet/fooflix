import { MediaItem, MediaType } from "@/types/tmdb";
import { FlixGenre, FlixMediaType, FlixMovie, FlixResponse, FlixSeries, FlixTypeMap, FlixUser, FlixUserRegister, JWTResponse } from "@/types/flix";
import zod from "zod";

const FLIX_API_BASE = 'http://localhost:8000/api/';

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

export function isFlixMovie(item: FlixMovie | FlixSeries): item is FlixMovie {
  return !("seasons" in item);
}

export function isFlixSeries(item: FlixMovie | FlixSeries): item is FlixSeries {
  return "seasons" in item;
}

export const FlixUserSchema = zod.object({
  id: zod.string(),
  email: zod.string().email(),
  username: zod.string(),
  can_create_flix: zod.boolean(),
});

export function isFlixUser(user: unknown): user is FlixUser {
  return FlixUserSchema.safeParse(user).success;
}

export const JWTResponseSchema = zod.object({
  refresh: zod.string(),
  access: zod.string(),
  access_expiration: zod.number(),
  refresh_expiration: zod.number(),
});

export function isJWTResponse(data: unknown): data is JWTResponse {
  return JWTResponseSchema.safeParse(data).success;
}

export const FlixUserRegisterSchema = zod.object({
  username: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
});

export function isFlixUserRegister(data: unknown): data is FlixUserRegister {
  return FlixUserRegisterSchema.safeParse(data).success;
}