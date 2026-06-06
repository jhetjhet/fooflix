"use client";

import { getBackdropUrl } from "@/services/tmdb";
import { TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { VideoPlayer } from "./video-player";
import MediaInfo, { MediaInfoSkeleton } from "./media-info";
import { SeasonSelector } from "./season-selector";
import { CastList } from "./cast-list";
import { BackdropsGallery } from "./backdrops-gallery";
import { UnifiedEpisode, UnifiedMovie, UnifiedSeries } from "@/types/unified";
import { VideoPlayer2, VideoPlayer2Handle } from "./video-player2";
import { useEffect, useRef, useState } from "react";
import { FlixMedia } from "@/types/flix";
import MediaPageContainer from "./media-page/container";
import useMediaProgress from "@/hooks/use-media-progress";
import { useAuthContext } from "@/context/authentication";

function isUnifiedSeries(
  media: TMDBMovieDetails | TMDBTVShowDetails,
): media is TMDBTVShowDetails {
  return "number_of_seasons" in media;
}

interface MediaDetailPageProps {
  media: UnifiedMovie | UnifiedSeries | undefined | null;
  isLoading?: boolean;
}

export default function MediaUnifiedDetailPage({
  media,
  isLoading = false,
}: MediaDetailPageProps) {
  if (isLoading || !media) {
    return <MediaInfoSkeleton />;
  }

  const { user } = useAuthContext();

  const vidPlayerRef = useRef<VideoPlayer2Handle>(null);

  const { record, getLocalProgressRecord } = useMediaProgress(
    vidPlayerRef,
    Boolean(!user),
  );

  const [selectedEpisode, setSelectedEpisode] = useState<UnifiedEpisode | null>(
    null,
  );

  const isTV = isUnifiedSeries(media);
  const mediaTtle = isTV ? media.name : media.title;
  const mediaData: FlixMedia | null = isTV ? selectedEpisode : media;
  const activeMediaType = isTV ? "episode" : "movie";
  const serverMediaId = isTV ? selectedEpisode?.flix_id?.toString() : media.flix_id;
  const localMediaId = isTV
    ? selectedEpisode?.tmdb_id ?? null
    : media.flix_id;
  const activeMediaId = user ? serverMediaId : (localMediaId ?? serverMediaId);

  useEffect(() => {
    return () => {
      if (activeMediaId) {
        record(activeMediaType, activeMediaId);
      }
    };
  }, [record, activeMediaId, activeMediaType]);

  return (
    <MediaPageContainer
      title={mediaTtle}
      backdropPath={media.backdrop_path}
      backLink={{ href: "/", label: "Back to Home" }}
    >
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Column - Video Player */}
          <div className="flex-1 min-w-0 space-y-6">
            <VideoPlayer2
              ref={vidPlayerRef}
              title={mediaTtle}
              posterUrl={getBackdropUrl(media.backdrop_path, "w1280")}
              src={mediaData?.video_url}
              subtitles={mediaData?.subtitles}
              onLoadedMetadata={(e) => {
                if (mediaData?.progress) {
                  const resumeTime = mediaData.progress.last_position_seconds;

                  vidPlayerRef.current?.seekTo(resumeTime);
                } else if (activeMediaId) {
                  const localProgress = getLocalProgressRecord(
                    activeMediaType,
                    activeMediaId,
                  );

                  if (localProgress?.last_position_seconds) {
                    vidPlayerRef.current?.seekTo(localProgress.last_position_seconds);
                  }
                }
              }}
              onTimeUpdate={(e) => {
                if (activeMediaId) {
                  record(activeMediaType, activeMediaId);
                }
              }}
              onSeek={(time) => {
                if (activeMediaId) {
                  record(activeMediaType, activeMediaId);
                }
              }}
              onPause={() => {
                if (activeMediaId) {
                  record(activeMediaType, activeMediaId);
                }
              }}
            />

            {/* Title & Meta for Mobile */}
            <div className="lg:hidden">
              <MediaInfo media={media} />
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                {media.overview || "No overview available."}
              </p>
            </div>

            {/* Seasons & Episodes */}
            {isTV && media.seasons && media.seasons.length > 0 && (
              <SeasonSelector
                tvId={media.id}
                seasons={media.seasons}
                selectedEpisode={selectedEpisode ?? undefined}
                onEpisodeSelect={(episode) => {
                  setSelectedEpisode(episode);
                }}
              />
            )}

            {/* Cast */}
            {media.credits?.cast && media.credits.cast.length > 0 && (
              <CastList cast={media.credits.cast} />
            )}

            {/* Backdrops Gallery */}
            {media.images?.backdrops && media.images.backdrops.length > 0 && (
              <BackdropsGallery
                backdrops={media.images.backdrops}
                title={mediaTtle}
              />
            )}
          </div>

          {/* Right Column - Info (Desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <MediaInfo media={media} />
            </div>
          </div>
        </div>
      </div>
    </MediaPageContainer>
  );
}
