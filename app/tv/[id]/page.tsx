import { notFound } from "next/navigation";
import { unifiedSeries } from "@/services/unified";
import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { getTMDBDetails } from "@/services/tmdb";
import { fetchFlixDetails } from "@/lib/flix-api.server";

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
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