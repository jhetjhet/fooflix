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
  extension: "",
  has_video: false, 
  video_path: "",
  video_url: "",
  subtitles: [],
};

function mapEpisode(flixEp: FlixEpisode): UnifiedEpisode {
  return {
    // FlixMedia fields
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
  };
}

export function unifiedMovie(
  tmdb: TMDBMovieDetails,
  flix: FlixMovie,
): UnifiedMovie {
  const { id, extension, has_video, video_path, video_url, subtitles } = flix;

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
  flix: FlixSeries,
): UnifiedSeries {
  const tmdbSeasonMap = new Map<number, TMDBSeason>(
    tmdb.seasons.map((s) => [s.season_number, s]),
  );

  // Inner join: only include seasons present in flix, using flix episode data
  const seasons: UnifiedSeason[] = (flix.seasons ?? [])
    .filter((fs) => tmdbSeasonMap.has(fs.season_number))
    .map((fs) => mapSeason(tmdbSeasonMap.get(fs.season_number)!, fs));

  return {
    ...tmdb,
    tmdb_id: flix.tmdb_id,
    seasons,
  };
}

