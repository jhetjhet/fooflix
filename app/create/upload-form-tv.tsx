import {
  TMDBEpisode,
  TMDBTVShow,
} from "@/types/tmdb";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { getTVSeasonDetails } from "@/services/tmdb";
import { cn } from "@/lib/utils";

interface SelectedItemInfoProps {
  tv: TMDBTVShow;
  onEpisodeSelect?: (episode: TMDBEpisode) => void;
}

export default function UploadFormTV({
  tv,
  onEpisodeSelect,
}: SelectedItemInfoProps) {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(
    null,
  );

  const { data: seasonDetails, isLoading: loadingEpisodes } = useSWR(
    selectedSeason ? [`tmdb-tv`, tv.id, `season`, selectedSeason] : null,
    ([, tvId, , season]) => getTVSeasonDetails(tvId, season),
  );

  const episodes = seasonDetails?.episodes || [];

  const handleSelectSeason = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    setSelectedEpisode(null);
  };

  const handleSelectEpisode = (episode: TMDBEpisode) => {
    setSelectedEpisode(episode);

    if (onEpisodeSelect) {
      onEpisodeSelect(episode);
    }
  };

  useEffect(() => {
    setSelectedSeason(null);
    setSelectedEpisode(null);
  }, [tv]);

  return (
    <Tabs defaultValue="seasons" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="seasons" className="flex-1">
          Seasons & Episodes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="seasons" className="mt-4">
        <div className="space-y-4">
          {/* Season Selector */}
          <div className="flex items-center gap-3">
            <Select
              value={selectedSeason?.toString() || ""}
              onValueChange={(value) => handleSelectSeason(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(
                  (seasonNum) => (
                    <SelectItem key={seasonNum} value={seasonNum.toString()}>
                      Season {seasonNum}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Episodes List */}
          {selectedSeason && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Episodes</h4>
              {loadingEpisodes ? (
                <div className="space-y-2">
                  {Array.from({
                    length: 5,
                  }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded" />
                  ))}
                </div>
              ) : episodes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No episodes found for this season
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {episodes.map((episode) => (
                    <button
                      key={episode.id}
                      onClick={() => handleSelectEpisode(episode)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded text-left text-sm transition-colors",
                        selectedEpisode?.id === episode.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80",
                      )}
                    >
                      <span className="font-mono text-xs opacity-60">
                        E{episode.episode_number.toString().padStart(2, "0")}
                      </span>
                      <span className="flex-1 line-clamp-1">
                        {episode.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
