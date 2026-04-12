import type {
  TMDBGenre,
  TMDBEpisode,
  TMDBSeason,
  TMDBTVShowDetails,
  TMDBMovieDetails,
} from "../tmdb";
import type {
  FlixGenre,
  FlixMedia,
  FlixMovie,
  FlixSeries,
} from "../flix";

export interface UnifiedGenre extends TMDBGenre, Pick<FlixGenre, "movie_count" | "series_count"> {}

export interface UnifiedEpisode extends FlixMedia, TMDBEpisode {
  tmdb_id: string;
  flix_exists: boolean;
}

export interface UnifiedSeason extends Omit<TMDBSeason, "episodes"> {
  episodes: UnifiedEpisode[];
  flix_exists: boolean;
}

type Merge<T, R> = Omit<T, keyof R> & R;
export interface UnifiedMovie extends Merge<
  TMDBMovieDetails,
  FlixMedia & {
    flix_id: FlixMovie["id"] | null;
  }
> {}

export interface UnifiedSeries extends Merge<
  TMDBTVShowDetails,
  {
    seasons: UnifiedSeason[];
    tmdb_id: FlixSeries["tmdb_id"];
    flix_id: FlixSeries["id"] | null;
  }
> {}
