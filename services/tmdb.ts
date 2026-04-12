import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBGenre,
  TMDBResponse,
  TMDBSeasonDetails,
  MediaItem,
  MediaType,
  TMDBTypeMap,
} from "@/types/tmdb";

// Use the proxy API base URL
const TMDB_API_BASE = process.env.NEXT_PUBLIC_TMDB_API_BASE || "";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image size helpers
export const getImageUrl = (
  path: string | null,
  size: string = "w500",
): string => {
  if (!path) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (
  path: string | null,
  size: string = "w1280",
): string => {
  if (!path) return "/placeholder-backdrop.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Generic fetch helper - includes api_key in params
async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });
  const url = `${TMDB_API_BASE}${endpoint}?${searchParams}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

// Movie endpoints
export async function getTrendingMovies(
  timeWindow: "day" | "week" = "week",
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`);
}

export async function getPopularMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/popular", {
    page: page.toString(),
  });
}

export async function getUpcomingMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/upcoming", {
    page: page.toString(),
  });
}

export async function getNowPlayingMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/now_playing", {
    page: page.toString(),
  });
}

export async function getTopRatedMovies(
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/top_rated", {
    page: page.toString(),
  });
}

export async function getMovieDetails(
  movieId: number,
  params: Record<string, string> = {},
): Promise<TMDBMovieDetails> {
  return fetchTMDB<TMDBMovieDetails>(`/movie/${movieId}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });
}

// TV Show endpoints
export async function getTrendingTVShows(
  timeWindow: "day" | "week" = "week",
): Promise<TMDBResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>(`/trending/tv/${timeWindow}`);
}

export async function getPopularTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/popular", {
    page: page.toString(),
  });
}

export async function getTopRatedTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/top_rated", {
    page: page.toString(),
  });
}

export async function getOnTheAirTVShows(
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/tv/on_the_air", {
    page: page.toString(),
  });
}

export async function getTVShowDetails(
  tvId: number,
  params: Record<string, string> = {},
): Promise<TMDBTVShowDetails> {
  return fetchTMDB<TMDBTVShowDetails>(`/tv/${tvId}`, {
    append_to_response: "credits,images,reviews",
    ...params,
  });
}

export async function getTVSeasonDetails(
  tvId: number,
  seasonNumber: number,
): Promise<TMDBSeasonDetails> {
  return fetchTMDB<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
}

// Genre endpoints
export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return fetchTMDB<{ genres: TMDBGenre[] }>("/genre/movie/list");
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return fetchTMDB<{ genres: TMDBGenre[] }>("/genre/tv/list");
}

// Search endpoints
export async function searchMovies(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie>> {
  return fetchTMDB<TMDBResponse<TMDBMovie>>("/search/movie", {
    query,
    page: page.toString(),
  });
}

export async function searchTVShows(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/search/tv", {
    query,
    page: page.toString(),
  });
}

export async function searchMulti(
  query: string,
  page: number = 1,
): Promise<TMDBResponse<TMDBMovie | TMDBTVShow>> {
  return fetchTMDB<TMDBResponse<TMDBMovie | TMDBTVShow>>("/search/multi", {
    query,
    page: page.toString(),
  });
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

  return fetchTMDB<TMDBResponse<TMDBMovie>>("/discover/movie", queryParams);
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

  return fetchTMDB<TMDBResponse<TMDBTVShow>>("/discover/tv", queryParams);
}

// Utility to convert TMDB data to app MediaItem
export function movieToMediaItem(
  movie: TMDBMovie | TMDBMovieDetails,
): MediaItem {
  let genreIds: number[] = [];

  if ("genre_ids" in movie) {
    genreIds = movie.genre_ids;
  } else if ("genres" in movie) {
    genreIds = movie.genres.map((g) => g.id);
  }

  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    overview: movie.overview,
    releaseDate: movie.release_date,
    voteAverage: movie.vote_average,
    mediaType: "movie",
    genreIds: genreIds,
  };
}

export function tvShowToMediaItem(
  tvShow: TMDBTVShow | TMDBTVShowDetails,
): MediaItem {
  let genreIds: number[] = [];

  if ("genre_ids" in tvShow) {
    genreIds = tvShow.genre_ids;
  } else if ("genres" in tvShow) {
    genreIds = tvShow.genres.map((g) => g.id);
  }

  return {
    id: tvShow.id,
    title: tvShow.name,
    posterPath: tvShow.poster_path,
    backdropPath: tvShow.backdrop_path,
    overview: tvShow.overview,
    releaseDate: tvShow.first_air_date,
    voteAverage: tvShow.vote_average,
    mediaType: "tv",
    genreIds: genreIds,
  };
}

// Check if item is a movie or TV show
export function isMovie(item: TMDBMovie | TMDBTVShow): item is TMDBMovie {
  return "title" in item;
}

export function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return "name" in item;
}

export function isMovieDetails(
  item: TMDBMovieDetails | TMDBTVShowDetails,
): item is TMDBMovieDetails {
  return "runtime" in item;
}

export function isTVShowDetails(
  item: TMDBMovieDetails | TMDBTVShowDetails,
): item is TMDBTVShowDetails {
  return "number_of_seasons" in item;
}

// Convert mixed results to MediaItems
export function toMediaItems(items: (TMDBMovie | TMDBTVShow)[]): MediaItem[] {
  return items.map((item) => {
    if (isMovie(item)) {
      return movieToMediaItem(item);
    }
    return tvShowToMediaItem(item);
  });
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
