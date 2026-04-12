"use client";

import { use, useMemo, useState } from "react";
import useSWR from "swr";
import { Play } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getTVSeasonDetails, getImageUrl } from "@/services/tmdb";
import type { TMDBSeason, TMDBEpisode } from "@/types/tmdb";
import { cn } from "@/lib/utils";
import { UnifiedEpisode, UnifiedSeason } from "@/types/unified";
import { DEFAULT_UNIFIED_EPISODE } from "@/services/unified";

// ─── EpisodeCardSkeleton ──────────────────────────────────────────────────────

function EpisodeCardSkeleton() {
  return (
    <div className="flex gap-4 p-3 rounded-lg bg-card">
      <Skeleton className="w-40 h-24 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

// ─── EpisodeCard ──────────────────────────────────────────────────────────────

interface EpisodeCardProps {
  isActive?: boolean;
  episode: UnifiedEpisode;
  onClick: (episode: UnifiedEpisode) => void;
}

function EpisodeCard({ episode, onClick, isActive }: EpisodeCardProps) {
  return (
    <button
      key={episode.id}
      onClick={() => onClick(episode)}
      className="w-full flex gap-4 p-3 rounded-lg bg-card hover:bg-card/80 transition-colors text-left group cursor-pointer"
    >
      {/* Episode Thumbnail */}
      <div className="relative w-40 h-24 rounded overflow-hidden bg-muted shrink-0">
        {episode.still_path ? (
          <img
            src={getImageUrl(episode.still_path, "w300")}
            alt={episode.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="size-8 text-muted-foreground" />
          </div>
        )}
        {/* Play Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isActive ? "opacity-100" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Play className="size-5 fill-primary-foreground text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium line-clamp-1">
            {episode.episode_number}. {episode.name}
          </h4>
          {episode.runtime && (
            <span className="text-xs text-muted-foreground shrink-0">
              {episode.runtime} min
            </span>
          )}
        </div>
        {episode.air_date && (
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(episode.air_date).toLocaleDateString()}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {episode.overview || "No description available."}
        </p>
      </div>
    </button>
  );
}

// ─── SeasonSelector ───────────────────────────────────────────────────────────

interface SeasonSelectorProps {
  tvId: number;
  seasons: UnifiedSeason[];
  onEpisodeSelect?: (episode: UnifiedEpisode) => void;
  selectedEpisode?: UnifiedEpisode;
  className?: string;
}

export function SeasonSelector({
  tvId,
  seasons,
  onEpisodeSelect,
  selectedEpisode,
  className,
}: SeasonSelectorProps) {
  // Filter out season 0 (specials) if it has no episodes
  const validSeasons = seasons.filter(
    (s) => s.season_number > 0 || s.episode_count > 0,
  );
  const [selectedSeason, setSelectedSeason] = useState(
    validSeasons.find((s) => s.season_number === 1)?.season_number ||
      validSeasons[0]?.season_number ||
      1,
  );

  // Fetch season details
  const { data: seasonDetails, isLoading } = useSWR(
    `tv-${tvId}-season-${selectedSeason}`,
    () => getTVSeasonDetails(tvId, selectedSeason),
  );

  const handleEpisodeClick = (episode: UnifiedEpisode) => {
    if (onEpisodeSelect) {
      onEpisodeSelect(episode);
    }
  };

  const mappedUnifiedEpisodes = useMemo(() => {
    const season = seasons.find((s) => s.season_number === selectedSeason);

    if (!season || !season.episodes) return {};

    return season.episodes.reduce((acc, episode) => {
      acc[episode.episode_number] = episode;
      return acc;
    }, {} as Record<number, UnifiedEpisode>);
  }, [seasons, selectedSeason]);

  const unifiedEpisodes = useMemo<UnifiedEpisode[]>(() => {
    if (!seasonDetails?.episodes) return [];

    return seasonDetails.episodes.map((episode) => ({
      ...(mappedUnifiedEpisodes[episode.episode_number] || {}),
      ...episode,
    }));
  }, [seasonDetails, mappedUnifiedEpisodes]);

  if (validSeasons.length === 0) return null;

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Episodes</h3>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(value) => setSelectedSeason(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {validSeasons.map((season) => (
              <SelectItem
                key={season.id}
                value={season.season_number.toString()}
              >
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episodes List */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <EpisodeCardSkeleton key={i} />
            ))
          : unifiedEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                isActive={selectedEpisode?.id === episode.id}
                onClick={handleEpisodeClick}
              />
            ))}
      </div>
    </div>
  );
}
