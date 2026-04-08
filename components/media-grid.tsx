"use client";

import { MediaCard, MediaCardSkeleton } from "@/components/media-card";
import type { MediaItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MediaGridProps {
  items: MediaItem[];
  isLoading?: boolean;
  className?: string;
}

export function MediaGrid({
  items,
  isLoading = false,
  className,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
          className,
        )}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <MediaCardSkeleton key={i} className="w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-1">No results found</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Try adjusting your search or filters to find what you&apos;re looking
          for.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4",
        className,
      )}
    >
      {items.map((item) => (
        <MediaCard
          key={`${item.mediaType}-${item.id}`}
          item={item}
          className="w-full"
        />
      ))}
    </div>
  );
}
