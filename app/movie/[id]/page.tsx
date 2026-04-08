"use client";

import { use } from "react";
import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";
import { notFound } from "next/navigation";
import useTMDBFlix from "@/hooks/use-tmdb-flix";
import { unifiedMovie } from "@/services/unified";

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = use(params);
  const movieId = parseInt(id);

  const { tmdb, flix, isLoading, error } = useTMDBFlix("movie", movieId);

  if (error) {
    notFound();
  }

  let unifiedMovieData = null;

  if (tmdb && flix) {
    unifiedMovieData = unifiedMovie(tmdb, flix);
  } 

  console.log("unifiedMovieData", unifiedMovieData);

  return (
    <MediaUnifiedDetailPage media={unifiedMovieData} isLoading={isLoading} />
  );
}
