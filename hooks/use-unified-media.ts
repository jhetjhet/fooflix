import { unifiedMovie, unifiedSeries } from "@/services/unified";
import { FlixEpisode, FlixMovie, FlixSeason, FlixSeries } from "@/types/flix";
import { TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { UnifiedEpisode, UnifiedMovie, UnifiedSeries } from "@/types/unified";
import { useState } from "react";

export default function useUnifiedMedia() {
  const [uMovie, setUMovie] = useState<UnifiedMovie | null>(null);
  const [uSeries, setUSeries] = useState<UnifiedSeries | null>(null);

  const createUnifiedMovie = (
    tmdb: TMDBMovieDetails,
    flix: FlixMovie | null | undefined,
  ) => {
    setUSeries(null);
    setUMovie(unifiedMovie(tmdb, flix));
  };

  const createUnifiedSeries = (
    tmdb: TMDBTVShowDetails,
    flix: FlixSeries | null | undefined,
  ) => {
    setUMovie(null);
    setUSeries(unifiedSeries(tmdb, flix));
  };

  const updateUnifiedMovie = (flix: FlixMovie) => {
    setUMovie((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        flix_id: flix.id,
        flix_exists: true,
        extension: flix.extension,
        has_video: flix.has_video,
        video_path: flix.video_path,
        video_url: flix.video_url,
        subtitles: flix.subtitles,
      };
    });
  };

  const updateUnifiedSeries = (flix: FlixSeries) => {
    setUSeries((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        flix_exists: true,
        flix_id: flix.id,
      };
    });
  };

  const updateUnifiedSeason = (flix: FlixSeason) => {
    setUSeries((prev) => {
      if (!prev) return null;

      const updatedSeasons = prev.seasons.map((season) => {
        if (season.season_number === flix.season_number) {
          return {
            ...season,
            flix_exists: true,
          };
        }
        return season;
      });

      return {
        ...prev,
        seasons: updatedSeasons,
      };
    });
  };

  const updateUnifiedEpisode = (flix: FlixEpisode) => {
    setUSeries((prev) => {
      if (!prev) return null;

      const updatedSeasons = prev.seasons.map((season) => {
        if (season.season_number === flix.season) {
          const updatedEpisodes = season.episodes.map((episode) => {
            if (episode.episode_number === flix.episode_number) {
              return {
                ...episode,
                flix_exists: true,
              };
            }
            return episode;
          });

          return {
            ...season,
            episodes: updatedEpisodes,
          };
        }
        return season;
      });

      return {
        ...prev,
        seasons: updatedSeasons,
      };
    });
  };

  const addOrUpdateUnifiedEpisode = (flix: UnifiedEpisode) => {
    setUSeries((prev) => {
      if (!prev) return null;

      const updatedSeasons = prev.seasons.map((season) => {
        if (season.season_number === flix.season_number) {
          const episodeExists = season.episodes.some(
            (episode) => episode.episode_number === flix.episode_number,
          );

          let updatedEpisodes;
          if (episodeExists) {
            updatedEpisodes = season.episodes.map((episode) => {
              if (episode.episode_number === flix.episode_number) {
                return {
                  ...episode,
                  ...flix,
                };
              }
              return episode;
            });
          } else {
            updatedEpisodes = [...season.episodes, flix];
          }

          return {
            ...season,
            episodes: updatedEpisodes,
          };
        }
        return season;
      });

      return {
        ...prev,
        seasons: updatedSeasons,
      };
    });
  }

  const controls = {
    createUnifiedMovie,
    createUnifiedSeries,
    updateUnifiedMovie,
    updateUnifiedSeries,
    updateUnifiedSeason,
    updateUnifiedEpisode,
    addOrUpdateUnifiedEpisode,
  };
  
  if (uMovie) {
    return {
      ...controls,
      uMovie,
      uSeries: null,
    };
  }

  return {
    ...controls,
    uMovie: null,
    uSeries,
  };
}
