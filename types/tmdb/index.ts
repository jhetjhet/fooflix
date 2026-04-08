// TMDB API Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
  imdb_id?: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  imdb_id?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBImage {
  file_path: string;
  aspect_ratio: number;
  width: number;
  height: number;
  vote_average: number;
}

export interface TMDBImages {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBVideos {
  results: TMDBVideo[];
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, "genre_ids"> {
  genres: TMDBGenre[];
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  credits?: TMDBCredits;
  images?: TMDBImages;
  videos?: TMDBVideos;
  recommendations?: TMDBResponse<TMDBMovie>;
}

export interface TMDBTVShowDetails extends Omit<TMDBTVShow, "genre_ids"> {
  genres: TMDBGenre[];
  episode_run_time: number[];
  status: string;
  tagline: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TMDBSeason[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  credits?: TMDBCredits;
  images?: TMDBImages;
  videos?: TMDBVideos;
  recommendations?: TMDBResponse<TMDBTVShow>;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string;
  vote_average: number;
  runtime: number;
}

export interface TMDBSeasonDetails extends TMDBSeason {
  episodes: TMDBEpisode[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// App-specific types
export type MediaType = "movie" | "tv" | "all";

export type TMDBTypeMap = {
  movie: TMDBMovieDetails;
  tv: TMDBTVShowDetails;
};

export interface MediaItem {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  mediaType: MediaType;
  genreIds: number[];
}

export interface BrowseFilters {
  query: string;
  type: MediaType;
  genre: number | null;
  sortBy: string;
  year: number | null;
  page: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface WatchTogetherRoom {
  roomId: string;
  hostId: string;
  mediaId: number;
  mediaType: MediaType;
  watcherCount: number;
}

export interface Subtitle {
  id: string;
  name: string;
  language: string;
  isDefault: boolean;
  file?: File;
}

export interface UploadFormData {
  mediaId: number;
  mediaType: MediaType;
  videoFile?: File;
  subtitles: Subtitle[];
  seasonNumber?: number;
  episodeNumber?: number;
}

// Auth types
export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}
