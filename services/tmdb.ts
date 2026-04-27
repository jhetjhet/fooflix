import type {
  TMDBMovie,
  TMDBTVShow,
  TMDBMovieDetails,
  TMDBTVShowDetails,
  MediaItem,
} from "@/types/tmdb";

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