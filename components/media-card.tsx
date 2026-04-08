"use client";

import Link from "next/link";
import { Play, Star } from "lucide-react";
import { getImageUrl } from "@/services/tmdb";
import type { MediaItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  showRating?: boolean;
  className?: string;
}

export function MediaCard({
  item,
  showRating = true,
  className,
}: MediaCardProps) {
  const href = `/${item.mediaType}/${item.id}`;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex-shrink-0 rounded-lg overflow-hidden bg-card transition-transform duration-300 hover:scale-105 hover:z-10",
        className,
      )}
    >
      <div className="aspect-[2/3] relative">
        <img
          src={getImageUrl(item.posterPath, "w342")}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="size-6 fill-primary-foreground text-primary-foreground ml-0.5" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-semibold text-white line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {showRating && item.voteAverage > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-white/90">
                    {item.voteAverage.toFixed(1)}
                  </span>
                </div>
              )}
              {item.releaseDate && (
                <span className="text-xs text-white/70">
                  {new Date(item.releaseDate).getFullYear()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-primary/90 text-primary-foreground">
          {item.mediaType === "tv" ? "Series" : "Movie"}
        </div>
      </div>

      {/* Title (visible without hover on mobile) */}
      <div className="p-2 md:hidden">
        <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
      </div>
    </Link>
  );
}

export function MediaCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex-shrink-0 rounded-lg overflow-hidden bg-card",
        className,
      )}
    >
      <div className="aspect-[2/3] bg-muted animate-pulse" />
      <div className="p-2 md:hidden">
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
      </div>
    </div>
  );
}
