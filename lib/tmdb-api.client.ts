import { TMDBGenre, TMDBMovie, TMDBMovieDetails, TMDBResponse, TMDBSeasonDetails, TMDBTVShow, TMDBTVShowDetails, TMDBTypeMap } from "@/types/tmdb";
import typedFetch from "./typed-fetch";
import { FetchResponse } from "@/types";

async function clientFetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const url = `/tmdb${endpoint}?${searchParams}`;

  const response = await typedFetch<FetchResponse<T>>(url);

  if (!response.ok) {
    throw new Error(`TMDB client API request at ${url} failed with status ${response.status} - ${response.error}`);
  }

  return response.data;
}

export async function cGetTMDBDetails<T extends keyof TMDBTypeMap>({
  type,
  id,
  params = {},
}: {
  type: T;
  id: number;
  params?: Record<string, string>;
}): Promise<TMDBTypeMap[T]> {
  const data = await clientFetchTMDB<TMDBTypeMap[T]>(`/${type}/${id}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });

  return data;
}

export async function cGetTVSeasonDetails(
  tvId: number,
  seasonNumber: number,
): Promise<TMDBSeasonDetails> {
  return clientFetchTMDB<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMovies(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/search/movie", {
    query,
    page: page.toString(),
  });
}

export async function searchTVShows(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>("/search/tv", {
    query,
    page: page.toString(),
  });
}

export async function searchMulti(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie | TMDBTVShow>>("/search/multi", {
    query,
    page: page.toString(),
  });
}

// Movie endpoints
export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week",
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`);
}

export async function getPopularMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/movie/popular", {
    page: page.toString(),
  });
}

export async function getUpcomingMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/movie/upcoming", {
    page: page.toString(),
  });
}

export async function getNowPlayingMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/movie/now_playing", {
    page: page.toString(),
  });
}

export async function getTopRatedMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/movie/top_rated", {
    page: page.toString(),
  });
}

export async function getMovieDetails(
  movieId: number,
  params: Record<string, string> = {},
): Promise<TMDBMovieDetails> {
  return clientFetchTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });
}

// TV Show endpoints
export async function getTrendingTVShows(
  timeWindow: "day" | "week" = "week",
): Promise<TMDBResponse<TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>(`/trending/tv/${timeWindow}`);
}

export async function getPopularTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/popular", {
    page: page.toString(),
  });
}

export async function getTopRatedTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/top_rated", {
    page: page.toString(),
  });
}

export async function getOnTheAirTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/on_the_air", {
    page: page.toString(),
  });
}

export async function getTVShowDetails(
  tvId: number,
  params: Record<string, string> = {},
): Promise<TMDBTVShowDetails> {
  return clientFetchTMDB<TMDBTVShowDetails>(`/tv/${tvId}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });
}

// Genre endpoints
export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return clientFetchTMDB<{ genres: TMDBGenre[] }>("/genre/movie/list");
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return clientFetchTMDB<{ genres: TMDBGenre[] }>("/genre/tv/list");
}

// Discover endpoints with filters
export async function discoverMovies(params: {
  page?: number;
  sortBy?: string;
  withGenres?: number;
  year?: number;
}): Promise<TMDBResponse<TMDBMovie>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sortBy || "popularity.desc",
  };

  if (params.withGenres) {
    queryParams.with_genres = params.withGenres.toString();
  }
  if (params.year) {
    queryParams.primary_release_year = params.year.toString();
  }

  return clientFetchTMDB<TMDBResponse<TMDBMovie>>("/discover/movie", queryParams);
}

export async function discoverTVShows(params: {
  page?: number;
  sortBy?: string;
  withGenres?: number;
  year?: number;
}): Promise<TMDBResponse<TMDBTVShow>> {
  const queryParams: Record<string, string> = {
    page: (params.page || 1).toString(),
    sort_by: params.sortBy || "popularity.desc",
  };

  if (params.withGenres) {
    queryParams.with_genres = params.withGenres.toString();
  }
  if (params.year) {
    queryParams.first_air_date_year = params.year.toString();
  }

  return clientFetchTMDB<TMDBResponse<TMDBTVShow>>("/discover/tv", queryParams);
}