import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { notFound } from "next/navigation";
import { unifiedMovie } from "@/services/unified";
import { fetchFlixMovie } from "@/services/flix";
import { getTMDBDetails } from "@/services/tmdb";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;

  const flixMovie = await fetchFlixMovie(id);
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
