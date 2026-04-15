
export type FlixMediaType = "movie" | "series" | "all";

export type FlixTypeMap = {
  movie: FlixMovie;
  series: FlixSeries;
};

export interface FlixResponse<T> {
  number: number;
  results: T[];
  next_page_number: number;
  previous_page_number: number;
  total_pages: number;
}

export interface FlixGenre {
  tmdb_id: string;
  name: string;
  movie_count: number;
  series_count: number;
}

export interface FlixSubtitle {
  id: number;
  name: string;
  is_default: boolean;
  language_code: string;
  url: string;
}

export interface FlixMedia {
  extension: string;
  has_video: boolean;
  video_path: string;
  video_url: string;
  subtitles: FlixSubtitle[];
}

export interface FlixBase {
  id: string;
  title: string;
  tmdb_id: string;
  poster_path: string | null;
  date_release: string | null;
  date_upload: string;
  genres: FlixGenre[];
}

export interface FlixMovie extends FlixMedia, FlixBase {
  type: "movie";
}

export interface FlixEpisode extends FlixMedia {
  episode_number: number;
  season: number;
  title: string;
  tmdb_id: string;
}

export interface FlixSeason {
  episodes: FlixEpisode[];
  season_number: number;
  title: string;
  tmdb_id: string;
}

export interface FlixSeries extends FlixBase {
  type: "series";
  seasons: FlixSeason[];
}

export interface FlixBrowseFilters {
  query: string;
  type: FlixMediaType;
  genre: number | null;
  sort_by: string;
  year: number | null;
  page: number;
}
export interface FlixUser {
  id: string;
  email: string;
  username: string;
  can_create_flix: boolean;
}
export interface JWTResponse {
  refresh: string;
  access: string;
  access_expiration: number; // Unix timestamp in seconds
  refresh_expiration: number; // Unix timestamp in seconds
}