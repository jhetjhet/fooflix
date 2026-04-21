import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import FlixFormMediaBase from "./flix-form-media-base";
import { isTVShow } from "@/services/tmdb";
import useTMDBFlix from "@/hooks/use-tmdb-flix";
import {
  isUnifiedEpisode,
  isUnifiedSeries,
} from "@/services/unified";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  UnifiedEpisode,
  UnifiedSeason,
} from "@/types/unified";
import FlixFormMediaSeries from "./flix-form-media-series";
import { UploadForm } from "./upload-form";
import { Button } from "./ui/button";
import useFormActions from "@/hooks/use-form-actions";
import useUnifiedMedia from "@/hooks/use-unified-media";
import { FlixSubtitle } from "@/types/flix";

interface FlixManagerContextValue {
  selectedSeason: number | null;
  setSelectedSeason: (season: number | null) => void;
  selectedEpisode: UnifiedEpisode | null;
  setSelectedEpisode: (episode: UnifiedEpisode | null) => void;
}

const flixManagerContext = createContext<FlixManagerContextValue | null>(null);

export function useFlixManager() {
  return useContext(flixManagerContext);
}

interface FlixFormManagerProps {
  tmdbMedia: TMDBMovie | TMDBTVShow;
}

export default function FlixFormManager({ tmdbMedia }: FlixFormManagerProps) {
  const [isRegisterPending, startRegisterTransition] = useTransition();

  const { registerMovie, registerEpisode } = useFormActions();

  const [selectedSeason, setSelectedSeason] = useState<UnifiedSeason | null>(
    null,
  );
  const [selectedEpisode, setSelectedEpisode] = useState<UnifiedEpisode | null>(
    null,
  );

  const isTV = isTVShow(tmdbMedia);

  const { isLoading: isTMDBFlixLoading, tmdb, flix, type } = useTMDBFlix(
    isTV ? "series" : "movie",
    tmdbMedia.id,
  );

  const {
    uMovie,
    uSeries,
    createUnifiedMovie,
    createUnifiedSeries,
    updateUnifiedMovie,
    updateUnifiedSeries,
    updateUnifiedSeason,
    addOrUpdateUnifiedEpisode,
    patchUnifiedEpisode,
    patchUnifiedMovie,
  } = useUnifiedMedia();

  useEffect(() => {
    setSelectedSeason(null);
    setSelectedEpisode(null);
  }, [tmdbMedia.id]);

  useEffect(() => {
    if (!tmdb) return;

    if (type === "series") {
      createUnifiedSeries(tmdb, flix);
    } else {
      createUnifiedMovie(tmdb, flix);
    }
  }, [tmdb, flix, type]);

  const unifiedBase = uMovie || uSeries;
  const unifiedMedia = uMovie || selectedEpisode;

  const isMediaRegistered = Boolean(uMovie?.flix_id) || selectedEpisode?.flix_exists;
  const isEpisode = unifiedMedia && isUnifiedEpisode(unifiedMedia);

  useEffect(() => {
    if (!uSeries) {
      return;
    }

    if (selectedEpisode) {
      const matchEpisode = uSeries.seasons
        .find((season) => season.season_number === selectedEpisode.season_number)
        ?.episodes.find((ep) => ep.episode_number === selectedEpisode.episode_number);

      setSelectedEpisode(matchEpisode ?? null);
    }

    if (selectedSeason) {
      const matchSeason = uSeries.seasons.find((season) => season.season_number === selectedSeason.season_number);
  
      setSelectedSeason(matchSeason ?? null);
    }
  }, [uSeries]);

  if (!unifiedBase) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Media info */}
      <FlixFormMediaBase unifiedMedia={unifiedBase} />

      {uSeries && isUnifiedSeries(uSeries) && (
        <FlixFormMediaSeries
          tv={uSeries}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          selectedEpisode={selectedEpisode}
          setSelectedEpisode={setSelectedEpisode}
        />
      )}

      {(!isTMDBFlixLoading &&!isMediaRegistered && unifiedMedia) && (
        <Button
          className="w-full"
          disabled={isRegisterPending}
          onClick={() => {
            if (isEpisode && uSeries) {
              startRegisterTransition(async () => {
                const [
                  newEpisode,
                  newSeason,
                  updatedSeries,
                ] = await registerEpisode(unifiedMedia, uSeries);

                if (updatedSeries) {
                  updateUnifiedSeries(updatedSeries);
                }

                if (newSeason) {
                  updateUnifiedSeason(newSeason);
                }

                if (newEpisode && selectedEpisode) {
                  addOrUpdateUnifiedEpisode({
                    ...unifiedMedia,
                    ...newEpisode,
                    flix_exists: true,
                  });
                }
              });
            } else if (uMovie) {
              startRegisterTransition(async () => {
                const newMovie = await registerMovie(uMovie);

                if (newMovie) {
                  updateUnifiedMovie(newMovie);
                }
              });
            }
          }}
        >
          {isRegisterPending
            ? "Registering..."
            : isEpisode
            ? "Register Episode"
            : "Register Movie"}
        </Button>
      )}

      {unifiedMedia && isMediaRegistered && (
        <UploadForm
          mediaData={uMovie || selectedEpisode}
          tmdbId={unifiedBase.id.toString()}
          onVideoUploadFinish={() => {
            if (isEpisode && selectedEpisode) {
              patchUnifiedEpisode({
                has_video: true,
                season: selectedEpisode.season_number,
                episode_number: selectedEpisode.episode_number,
              });
            } else if (uMovie) {
              patchUnifiedMovie({
                has_video: true,
              });
            }
          }}
          onNewSubtitles={(subtitles) => {
            const newSubtitles: FlixSubtitle[] = subtitles.map((s) => ({
              id: parseInt(s.id),
              name: s.name,
              srclng: s.srclng,
              is_default: s.is_default,
              subtitle: s.subtitle instanceof File ? "" : s.subtitle?.toString() || "",
              subtitle_exists: Boolean(s.subtitle),
            }));

            if (isEpisode && selectedEpisode) {
              patchUnifiedEpisode({
                season: selectedEpisode.season_number,
                episode_number: selectedEpisode.episode_number,
                subtitles: newSubtitles,
              });
            } else if (uMovie) {
              patchUnifiedMovie({
                subtitles: newSubtitles,
              });
            }
          }}
        />
      )}
    </div>
  );
}
