import { MediaItem, MediaType } from "@/types/tmdb";
import {
  FlixMovie,
  FlixSeries,
} from "@/types/flix";

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