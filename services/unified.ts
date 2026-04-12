import type {
  TMDBMovieDetails,
  TMDBTVShowDetails,
  TMDBSeason,
} from "../types/tmdb";
import type {
  FlixMovie,
  FlixSeries,
  FlixSeason,
  FlixEpisode,
} from "../types/flix";
import type {
  UnifiedMovie,
  UnifiedSeries,
  UnifiedSeason,
  UnifiedEpisode,
} from "../types/unified";
import { DEFAULT_FLIX_MOVIE, DEFAULT_FLIX_SERIES } from "./flix";

export const DEFAULT_UNIFIED_EPISODE: UnifiedEpisode = {
  // TMDBEpisode defaults
  id: 0,
  name: "",
  overview: "",
  still_path: null,
  episode_number: 0,
  season_number: 0,
  air_date: "",
  vote_average: 0,
  runtime: 0,
  // FlixMedia defaults
  tmdb_id: "",
  extension: "",
  has_video: false, 
  video_path: "",
  video_url: "",
  subtitles: [],
  flix_exists: false,
};

function mapEpisode(flixEp: FlixEpisode): UnifiedEpisode {
  return {
    // FlixMedia fields
    tmdb_id: flixEp.tmdb_id,
    extension: flixEp.extension,
    has_video: flixEp.has_video,
    video_path: flixEp.video_path,
    video_url: flixEp.video_url,
    subtitles: flixEp.subtitles,
    // TMDBEpisode fields — derive from flix where possible, default the rest
    id: parseInt(flixEp.tmdb_id, 10),
    name: flixEp.title,
    overview: "",
    still_path: null,
    episode_number: flixEp.episode_number,
    season_number: flixEp.season,
    air_date: "",
    vote_average: 0,
    runtime: 0,
    flix_exists: false,
  };
}

function mapSeason(
  tmdbSeason: TMDBSeason,
  flixSeason: FlixSeason,
): UnifiedSeason {
  return {
    id: tmdbSeason.id,
    name: tmdbSeason.name,
    overview: tmdbSeason.overview,
    poster_path: tmdbSeason.poster_path,
    season_number: tmdbSeason.season_number,
    episode_count: tmdbSeason.episode_count,
    air_date: tmdbSeason.air_date,
    // Flix episodes take priority
    episodes: (flixSeason.episodes ?? []).map(mapEpisode),
    flix_exists: true,
  };
}

export function unifiedMovie(
  tmdb: TMDBMovieDetails,
  flix: FlixMovie | null,
): UnifiedMovie {
  const { id, extension, has_video, video_path, video_url, subtitles } = flix || DEFAULT_FLIX_MOVIE;

  return {
    ...tmdb,
    extension,
    has_video,
    video_path,
    video_url,
    subtitles,
    flix_id: id,
  };
}

export function unifiedSeries(
  tmdb: TMDBTVShowDetails,
  flix: FlixSeries | null,
): UnifiedSeries {
  const flixSeasonMap = new Map<number, FlixSeason>(
    (flix?.seasons ?? []).map((s) => [s.season_number, s]),
  );

  // Left join: all TMDB seasons, merged with flix episode data where available
  const seasons: UnifiedSeason[] = tmdb.seasons.map((ts) =>
    mapSeason(ts, flixSeasonMap.get(ts.season_number) ?? { season_number: ts.season_number, title: "", tmdb_id: "", episodes: [] }),
  );

  return {
    ...DEFAULT_FLIX_SERIES,
    ...tmdb,
    tmdb_id: flix?.tmdb_id || "",
    flix_id: flix?.id || null,
    seasons,
  };
}

export function isUnifiedMovie(item: UnifiedMovie | UnifiedSeries): item is UnifiedMovie {
  return "runtime" in item;
}

export function isUnifiedSeries(item: UnifiedMovie | UnifiedSeries): item is UnifiedSeries {
  return "number_of_seasons" in item;
}

