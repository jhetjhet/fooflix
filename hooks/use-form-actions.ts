import {
  createFlixEpisode,
  createFlixMedia,
  createFlixSeason,
} from "@/app/actions/flix";
import { FetchResponse } from "@/types";
import {
  FlixEpisode,
  FlixEpisodeForm,
  FlixEpisodeSchema,
  FlixMediaForm,
  FlixMovie,
  FlixMovieSchema,
  FlixSeason,
  FlixSeasonForm,
  FlixSeasonSchema,
  FlixSeries,
  FlixSeriesSchema,
} from "@/types/flix";
import {
  UnifiedEpisode,
  UnifiedMovie,
  UnifiedSeason,
  UnifiedSeries,
} from "@/types/unified";
import { useTransition } from "react";

export default function useFormActions(): {
    registerMovie: (movie: UnifiedMovie) => Promise<FlixMovie>;
    registerSeries: (series: UnifiedSeries) => Promise<FlixSeries>;
    registerSeason: (seriesId: string, season: UnifiedSeason) => Promise<FlixSeason>;
    registerEpisode: (episode: UnifiedEpisode, series: UnifiedSeries) => Promise<[FlixEpisode, FlixSeason | null, FlixSeries | null]>;
} {
  const [isMovieRegisterPending, startMovieRegisterTransition] =
    useTransition();
  const [isEpisodeRegisterPending, startEpisodeRegisterTransition] =
    useTransition();
  const [isSeasonRegisterPending, startSeasonRegisterTransition] =
    useTransition();
  const [isSeriesRegisterPending, startSeriesRegisterTransition] =
    useTransition();

  const registerMovie = async (movie: UnifiedMovie) => {
    const flixMediaFormData: FlixMediaForm = {
      title: movie.title,
      tmdb_id: movie.id.toString(),
      date_release: movie.release_date,
      poster_path: movie.poster_path,
      genres: movie.genres.map((genre) => ({
        tmdb_id: genre.id.toString(),
        name: genre.name,
      })),
    };

    const response = await createFlixMedia(true, flixMediaFormData);

    if (!response.ok) {
      throw new Error("Failed to register movie");
    }

    const movieResult = FlixMovieSchema.safeParse(response.data);

    if (!movieResult.success) {
      throw new Error("Invalid movie response data");
    }

    return movieResult.data;
  };

  const registerSeries = async (series: UnifiedSeries) => {
    const flixMediaFormData: FlixMediaForm = {
      title: series.name,
      tmdb_id: series.id.toString(),
      date_release: series.first_air_date,
      poster_path: series.poster_path,
      genres: series.genres.map((genre) => ({
        tmdb_id: genre.id.toString(),
        name: genre.name,
      })),
    };

    const response = await createFlixMedia(false, flixMediaFormData);

    if (!response.ok) {
      throw new Error("Failed to register series");
    }

    const seriesResult = FlixSeriesSchema.safeParse(response.data);

    if (!seriesResult.success) {
      throw new Error("Invalid series response data");
    }

    return seriesResult.data;
  };

  const registerSeason = async (seriesId: string, season: UnifiedSeason) => {
    const flixSeasonFormData: FlixSeasonForm = {
      title: season.name,
      tmdb_id: season.id.toString(),
      season_number: season.season_number,
    };

    const response = await createFlixSeason(seriesId, flixSeasonFormData);

    if (!response.ok) {
      throw new Error("Failed to register season");
    }

    const seasonResult = FlixSeasonSchema.safeParse(response.data);

    if (!seasonResult.success) {
      throw new Error("Invalid season response data");
    }

    return seasonResult.data;
  };

  const registerEpisode = async (
    episode: UnifiedEpisode,
    series: UnifiedSeries,
  ): Promise<[FlixEpisode, FlixSeason | null, FlixSeries | null]> => {
    let createdSeries: FlixSeries | null = null;
    let createdSeason: FlixSeason | null = null;

    const unifiedSeason: UnifiedSeason | undefined = series.seasons.find(
      (s) => s.season_number === episode.season_number,
    );

    if (!unifiedSeason) {
      throw new Error("Season not found for episode");
    }

    if (!series.flix_id) {
      const seriesResponse = await registerSeries(series);

      createdSeries = seriesResponse;
    }

    if (unifiedSeason && (createdSeries || !unifiedSeason?.flix_exists)) {
      const seasonResponse = await registerSeason(
        series.id.toString(),
        unifiedSeason,
      );

      createdSeason = seasonResponse;
    }

    const flixEpisodeFormData: FlixEpisodeForm = {
      title: episode.name,
      tmdb_id: episode.id.toString(),
      episode_number: episode.episode_number,
    };

    const episodeResponse = await createFlixEpisode(
      series.id.toString(),
      episode.season_number,
      flixEpisodeFormData,
    );

    if (!episodeResponse.ok) {
      throw new Error("Failed to register episode");
    }

    const flixEpisodeResult = FlixEpisodeSchema.safeParse(episodeResponse.data);

    if (!flixEpisodeResult.success) {
      throw new Error("Invalid episode response data");
    }

    return [flixEpisodeResult.data, createdSeason, createdSeries];
  };

  return {
    registerMovie,
    registerSeries,
    registerSeason,
    registerEpisode,
  };
}
