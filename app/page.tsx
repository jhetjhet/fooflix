import { HeroBanner } from "@/components/hero-banner";
import { MediaCarousel } from "@/components/media-carousel";
import {
  movieToMediaItem,
  tvShowToMediaItem,
} from "@/services/tmdb";
import type { MediaItem, TMDBMovie, TMDBResponse } from "@/types/tmdb";
import { FlixMediaType } from "@/types/flix";
import { flixToMediaItem } from "@/services/flix";
import { fetchFlixItems, fetchFlixUser } from "@/lib/flix-api.server";
import { fetchTMDB, getTMDBDetails } from "@/lib/tmdb-api.server";

export const revalidate = 60;

const fetchTMDBPopularMovies = async (): Promise<MediaItem[]> => {
  const response = await fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/popular");

  if (!response || !response.results) {
    console.error("Failed to fetch popular movies from TMDB:", response);
    return [];
  }

  // select only first 5
  return response.results.map(movieToMediaItem).slice(0, 5);
}

const fetchTrendingTMDBMovies = async (): Promise<MediaItem[]> => {
  const response = await fetchTMDB<TMDBResponse<TMDBMovie>>("/trending/movie/week");

  if (!response || !response.results) {
    console.error("Failed to fetch trending movies from TMDB:", response);
    return [];
  }

  // select only first 5
  return response.results.map(movieToMediaItem);
}

const fetchTMDBTopRatedMovies = async (): Promise<MediaItem[]> => {
  const response = await fetchTMDB<TMDBResponse<TMDBMovie>>("/movie/top_rated");

  if (!response || !response.results) {
    console.error("Failed to fetch top rated movies from TMDB:", response);
    return [];
  }

  // select only first 5
  return response.results.map(movieToMediaItem);
}

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
  const data = await fetchFlixItems(type, {
    ordering: "-date_upload",
    page_size: "16",
  });

  if (!data?.results) return [];
  return data.results.map((item) => flixToMediaItem(item));
};

export default async function HomePage() {
  const user = await fetchFlixUser();
  const withP2P = user?.with_p2p_stream ?? false;

  const heroBannerSource = withP2P ? fetchTMDBPopularMovies : fetchRecentFlixItems;

  const heroBannerItems = await heroBannerSource();

  const mediaSectionsTitle = [
    "Movies You Might Like",
    "Tv Shows You Might Like",
  ];

  const mediaSectionsFetchers = [
    () => fetchFlixMediaItems("movie"),
    () => fetchFlixMediaItems("series"),
  ];

  if (withP2P) {
    mediaSectionsTitle.unshift("Trending Movies");
    mediaSectionsTitle.unshift("Top Rated Movies");

    mediaSectionsFetchers.unshift(() => fetchTrendingTMDBMovies());
    mediaSectionsFetchers.unshift(() => fetchTMDBTopRatedMovies());
  }

  const mediaSectionsData = await Promise.all(mediaSectionsFetchers.map((fetcher) => fetcher()));

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner items={heroBannerItems} />

      {/* Content Sections */}
      <div className="container mx-auto py-8 space-y-10 md:space-y-12">
        {mediaSectionsData.map((items, index) => (
          <MediaCarousel
            key={index}
            title={mediaSectionsTitle[index]}
            items={items}
          />
        ))}
      </div>
    </div>
  );
}
