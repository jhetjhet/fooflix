import { notFound } from "next/navigation";
import { unifiedSeries } from "@/services/unified";
import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { fetchFlixDetails } from "@/lib/flix-api.server";
import { getTMDBDetails } from "@/lib/tmdb-api.server";
import { getBackdropUrl } from "@/services/tmdb";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  const tmdbSeries = await getTMDBDetails({
    type: "tv",
    id: parseInt(id),
  });
  const metaData: Metadata = {
    title: `${tmdbSeries.name} | FooFlix`,
    description: `Watch ${tmdbSeries.name} and more on FooFlix. Stream movies and TV series anytime, anywhere.`,

    openGraph: {
      title: `Watch ${tmdbSeries.name} on FooFlix!`,
      description: tmdbSeries.overview,
      siteName: "FooFlix",
      locale: "en_US",
    },
  };

  if (tmdbSeries.poster_path) {
    metaData.openGraph = {
      ...metaData.openGraph,
      images: [getBackdropUrl(tmdbSeries.poster_path)],
    };
  }

  return metaData;
}

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const { id } = await params;

  const flixSeries = await fetchFlixDetails({
    type: "series",
    id,
  });
  const tmdbSeries = await getTMDBDetails({
    type: "tv",
    id: parseInt(id),
  });

  const uSeries = unifiedSeries(tmdbSeries, flixSeries);

  if (!uSeries) {
    notFound();
  }

  return (
    <MediaUnifiedDetailPage media={uSeries} />
  );
}