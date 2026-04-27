import { HeroBanner } from "@/components/hero-banner";
import { MediaCarousel } from "@/components/media-carousel";
import {
  movieToMediaItem,
  tvShowToMediaItem,
} from "@/services/tmdb";
import type { MediaItem } from "@/types/tmdb";
import { FlixMediaType } from "@/types/flix";
import { flixToMediaItem } from "@/services/flix";
import { fetchFlixItems } from "@/lib/flix-api.server";
import { getTMDBDetails } from "@/lib/tmdb-api.server";

export const revalidate = 60;

const fetchRecentFlixItems = async (): Promise<MediaItem[]> => {
  const data = await fetchFlixItems("all", {
    ordering: "-date_upload",
    page: "1",
    page_size: "5",
  });

  const tmdbDetailsRequests = data.results.map((item) => {
    const type = "seasons" in item ? "tv" : "movie";
    return getTMDBDetails({ type, id: parseInt(item.tmdb_id) });
  });

  const mediaItems: MediaItem[] = [];

  try {
    await Promise.all(tmdbDetailsRequests).then((results) => {
    results.forEach((result) => {
      if ("title" in result) {
        mediaItems.push(movieToMediaItem(result));
      } else if ("name" in result) {
        mediaItems.push(tvShowToMediaItem(result));
      }
    });
  });
  } catch (error) {
    console.error("Error fetching TMDB details for recent Flix items:", error);
  }

  return mediaItems;
};

const fetchFlixMediaItems = async (
  type: FlixMediaType = "movie",
): Promise<MediaItem[]> => {
  const data = await fetchFlixItems(type);

  if (!data?.results) return [];
  return data.results.map((item) => flixToMediaItem(item));
};

export default async function HomePage() {
  const [recentFlixItems, flixMovies, flixSeries] = await Promise.all([
    fetchRecentFlixItems(),
    fetchFlixMediaItems("movie"),
    fetchFlixMediaItems("series"),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner items={recentFlixItems} />

      {/* Content Sections */}
      <div className="container mx-auto py-8 space-y-10 md:space-y-12">

        <MediaCarousel
          title="Movies"
          items={flixMovies}
        />

        <MediaCarousel
          title="Series"
          items={flixSeries}
        />
      </div>
    </div>
  );
}
