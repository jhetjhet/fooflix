import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { notFound } from "next/navigation";
import { unifiedMovie } from "@/services/unified";
import { fetchFlixDetails } from "@/lib/flix-api.server";
import { getTMDBDetails } from "@/lib/tmdb-api.server";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
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
