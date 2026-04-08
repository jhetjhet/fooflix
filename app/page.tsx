"use client";

import useSWR from "swr";
import { HeroBanner, HeroBannerSkeleton } from "@/components/hero-banner";
import { MediaCarousel } from "@/components/media-carousel";
import {
  movieToMediaItem,
  tvShowToMediaItem,
  getTMDBDetails,
} from "@/services/tmdb";
import type { MediaItem, TMDBMovieDetails, TMDBTVShowDetails } from "@/types/tmdb";
import { FlixMediaType, FlixMovie, FlixSeries } from "@/types/flix";
import { fetchFlixItems, flixToMediaItem } from "@/services/flix";

// Fetchers for SWR
const fetchRecentFlixItems = async (): Promise<MediaItem[]> => { 
    const data = await fetchFlixItems<FlixMovie | FlixSeries>(
      "all",
      {
        ordering: "-date_upload",
        page: "1",
        page_size: "5",
      }
    );

    const tmdbDetailsRequests = data.results.map((item) => {
      const type = "seasons" in item ? "tv" : "movie";

      return getTMDBDetails({
        type,
        id: parseInt(item.tmdb_id),
      });
    });

    const mediaItems: MediaItem[] = [];

    await Promise.all(tmdbDetailsRequests).then((results) => {
      results.forEach((result) => {
        if ("title" in result) {
          mediaItems.push(movieToMediaItem(result as TMDBMovieDetails));
        } else if ("name" in result) {
          mediaItems.push(tvShowToMediaItem(result as TMDBTVShowDetails));
        }
      });
    });

    return mediaItems || [];
}

const fetchFlixMediaItems = async (
  type: FlixMediaType = "movie",
): Promise<MediaItem[]> => {
  const data = await fetchFlixItems<FlixMovie | FlixSeries>(type);

  let items: MediaItem[] = [];

  if (data && data.results) {
    items = data.results.map((movie) => flixToMediaItem(movie));
  }

  return items;
}

export default function HomePage() {
  const { data: recentFlixItems, isLoading: loadingRecentFlixItems } = useSWR(
    "recent-flix-items",
    fetchRecentFlixItems,
  );

  const { data: flixMovies, isLoading: loadingFlixMovies } = useSWR(
    "flix-movies",
    () => fetchFlixMediaItems("movie"),
  );

  const { data: flixSeries, isLoading: loadingFlixSeries } = useSWR(
    "flix-series",
    () => fetchFlixMediaItems("series"),
  );

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      {loadingRecentFlixItems || !recentFlixItems ? (
        <HeroBannerSkeleton />
      ) : (
        <HeroBanner items={recentFlixItems} />
      )}

      {/* Content Sections */}
      <div className="container mx-auto py-8 space-y-10 md:space-y-12">

        <MediaCarousel
          title="Movies"
          items={flixMovies || []}
          isLoading={loadingFlixMovies}
        />

        <MediaCarousel
          title="Series"
          items={flixSeries || []}
          isLoading={loadingFlixSeries}
        />
      </div>
    </div>
  );
}
