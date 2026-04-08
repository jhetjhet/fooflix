import { getBackdropUrl } from "@/services/tmdb";
import { TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VideoPlayer } from "./video-player";
import MediaInfo, { MediaInfoSkeleton } from "./media-info";
import { SeasonSelector } from "./season-selector";
import { CastList } from "./cast-list";
import { BackdropsGallery } from "./backdrops-gallery";
import { UnifiedEpisode, UnifiedMovie, UnifiedSeries } from "@/types/unified";
import { VideoPlayer2 } from "./video-player2";
import { useState } from "react";
import { FlixMedia } from "@/types/flix";

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

  const [selectedEpisode, setSelectedEpisode] = useState<UnifiedEpisode | null>(
    null,
  );

  const isTV = isUnifiedSeries(media);
  const mediaTtle = isTV ? media.name : media.title;
  const mediaData: FlixMedia | null = isTV ? selectedEpisode : media;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(media.backdrop_path, "original")}
            alt={mediaTtle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        </div>

        {/* Back Button */}
        <div className="absolute top-20 left-4 z-10">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Left Column - Video Player */}
          <div className="flex-1 min-w-0 space-y-6">
            {mediaData && mediaData.video_url ? (
              <VideoPlayer2
                title={mediaTtle}
                // posterUrl={getBackdropUrl(media.backdrop_path, "w1280")}
                src={mediaData.video_url}
              />
            ) : (
              <VideoPlayer
                title={mediaTtle}
                posterUrl={getBackdropUrl(media.backdrop_path, "w1280")}
              />
            )}

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
    </div>
  );
}
