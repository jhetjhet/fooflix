import { useMemo } from "react";
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
import { UnifiedEpisode, UnifiedSeries } from "@/types/unified";
import { DEFAULT_UNIFIED_EPISODE } from "@/services/unified";

interface FlixFormMediaSeriesProps {
  tv: UnifiedSeries;
  seasonNumber: number | null;
  selectedEpisode: UnifiedEpisode | null;
  setSelectedEpisode?: (episode: UnifiedEpisode | null) => void;
  setSeasonNumber?: (season: number | null) => void;
}

export default function FlixFormMediaSeries({
  tv,
  seasonNumber,
  selectedEpisode,
  setSelectedEpisode,
  setSeasonNumber,
}: FlixFormMediaSeriesProps) {

  const { data: seasonDetails, isLoading: loadingEpisodes } = useSWR(
    seasonNumber ? [`tv`, tv.id, `season`, seasonNumber] : null,
    ([, tvId, , season]) => getTVSeasonDetails(tvId, season),
  );

  const mappedUnifiedEpisodes = useMemo(() => {
    const season = tv.seasons.find((s) => s.season_number === seasonNumber);

    if (!season || !season.episodes) return {};

    return season.episodes.reduce((acc, eps) => {
      acc[eps.episode_number] = eps;
      return acc;
    }, {} as Record<number, UnifiedEpisode>);
  }, [tv, seasonNumber]);

  const unifiedEpisodes = useMemo<UnifiedEpisode[]>(() => {
    if (!seasonDetails?.episodes) return [];

    return seasonDetails.episodes.map((eps) => ({
      ...(mappedUnifiedEpisodes[eps.episode_number] || DEFAULT_UNIFIED_EPISODE),
      ...eps,
    }));
  }, [seasonDetails, mappedUnifiedEpisodes]);

  const handleSelectSeason = (seasonNumber: number) => {
    setSeasonNumber?.(seasonNumber);
    setSelectedEpisode?.(null);
  };

  const handleSelectEpisode = (episode: UnifiedEpisode) => {
    setSelectedEpisode?.(episode);
  };

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
              value={seasonNumber?.toString() || ""}
              onValueChange={(value) => handleSelectSeason(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {tv.seasons.map(
                  (season) => (
                    <SelectItem key={season.season_number} value={season.season_number.toString()}>
                      {season.name ? season.name : `Season ${season.season_number}`}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Episodes List */}
          {seasonNumber && (
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
              ) : unifiedEpisodes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No episodes found for this season
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {unifiedEpisodes.map((episode) => (
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
