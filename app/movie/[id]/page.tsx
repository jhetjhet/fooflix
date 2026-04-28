import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { notFound } from "next/navigation";
import { unifiedMovie } from "@/services/unified";
import { fetchFlixDetails } from "@/lib/flix-api.server";
import { getTMDBDetails } from "@/lib/tmdb-api.server";
import { Metadata } from "next";
import { getBackdropUrl } from "@/services/tmdb";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  const tmdbMovie = await getTMDBDetails({
    type: "movie",
    id: parseInt(id),
  });
  const metaData: Metadata = {
    title: `${tmdbMovie.title} | FooFlix`,
    description: `Watch ${tmdbMovie.title} and more on FooFlix. Stream movies and TV series anytime, anywhere.`,

    openGraph: {
      title: `Watch ${tmdbMovie.title} on FooFlix!`,
      description: tmdbMovie.overview,
      siteName: "FooFlix",
      locale: "en_US",
    },
  };

  if (tmdbMovie.poster_path) {
    metaData.openGraph = {
      ...metaData.openGraph,
      images: [getBackdropUrl(tmdbMovie.poster_path)],
    };
  }

  return metaData;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;

  const flixMovie = await fetchFlixDetails({
    type: "movie",
    id,
  });
  const tmdbMovie = await getTMDBDetails({
    type: "movie",
    id: parseInt(id),
  });

  const uMovie = unifiedMovie(tmdbMovie, flixMovie);

  if (!uMovie) {
    notFound();
  }

  return (
    <MediaUnifiedDetailPage media={uMovie} />
  );
}
