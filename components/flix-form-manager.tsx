import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import FlixFormMediaBase from "./flix-form-media-base";
import { isTVShow } from "@/services/tmdb";
import useTMDBFlix from "@/hooks/use-tmdb-flix";
import { isUnifiedMovie, isUnifiedSeries } from "@/services/unified";
import { createContext, useContext, useEffect, useState } from "react";
import { UnifiedEpisode, UnifiedMovie } from "@/types/unified";
import FlixFormMediaSeries from "./flix-form-media-series";
import { UploadForm } from "./upload-form";

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

export default function FlixFormManager({ 
  tmdbMedia,
}: FlixFormManagerProps) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<UnifiedEpisode | null>(null);

  const isTV = isTVShow(tmdbMedia);

  const { unified, mutateFlix } = useTMDBFlix(isTV ? "series" : "movie", tmdbMedia.id);
 
  const [unifiedMedia, setUnifiedMedia] = useState<UnifiedMovie | UnifiedEpisode | null>(null);

  useEffect(() => {
    setSelectedSeason(null);
    setSelectedEpisode(null);
  }, [tmdbMedia]);

  useEffect(() => {
    if (selectedEpisode) {
      setUnifiedMedia(selectedEpisode);
    }
    else if (unified && isUnifiedMovie(unified)) {
      setUnifiedMedia(unified);
    }
  }, [unified, selectedEpisode]);

  if (!unified) {
    return null;
  }

  const isUnifiedEpisode = (unifiedMedia && "episode_number" in unifiedMedia);

  return (
    <div className="space-y-6">
      {/* Media info */}
      <FlixFormMediaBase unifiedMedia={unified} />

      {(unified && isUnifiedSeries(unified)) && (
        <FlixFormMediaSeries
          tv={unified}
          seasonNumber={selectedSeason}
          setSeasonNumber={setSelectedSeason}
          selectedEpisode={selectedEpisode}
          setSelectedEpisode={setSelectedEpisode}
        />
      )}

      {unifiedMedia && (
        <UploadForm 
          title={isUnifiedEpisode ? unifiedMedia.name : unifiedMedia.title}
        />
      )}
    </div>
  );
}
