"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import useTMDBFlix from "@/hooks/use-tmdb-flix";
import { unifiedSeries } from "@/services/unified";
import MediaUnifiedDetailPage from "@/components/media-unified-detail-page";

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TVDetailPage({ params }: TVDetailPageProps) {
  const { id } = use(params);
  const tvId = parseInt(id);

  const { tmdb, flix, isLoading, error } = useTMDBFlix("series", tvId);

  if (error) {
    notFound();
  }

  let unifiedSeriesData = null;

  if (tmdb && flix) {
    unifiedSeriesData = unifiedSeries(tmdb, flix);
  }

  console.log("unifiedSeriesData", unifiedSeriesData);

  return (
    <MediaUnifiedDetailPage media={unifiedSeriesData} isLoading={isLoading} />
  );
}