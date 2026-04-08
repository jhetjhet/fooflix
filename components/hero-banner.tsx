"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackdropUrl } from "@/services/tmdb";
import type { MediaItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  items: MediaItem[];
  className?: string;
}

export function HeroBanner({ items, className }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = items[currentIndex];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (!currentItem) return null;

  return (
    <div
      className={cn(
        "relative w-full h-[70vh] md:h-[80vh] overflow-hidden",
        className,
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={getBackdropUrl(currentItem.backdropPath, "original")}
          alt={currentItem.title}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24 pt-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-primary text-primary-foreground">
              {currentItem.mediaType === "tv" ? "Series" : "Movie"}
            </span>
            {currentItem.voteAverage > 0 && (
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {currentItem.voteAverage.toFixed(1)}
                </span>
              </div>
            )}
            {currentItem.releaseDate && (
              <span className="text-sm text-muted-foreground">
                {new Date(currentItem.releaseDate).getFullYear()}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
            {currentItem.title}
          </h1>

          {/* Overview */}
          <p className="text-sm md:text-base text-muted-foreground line-clamp-3 mb-6 max-w-xl">
            {currentItem.overview}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href={`/${currentItem.mediaType}/${currentItem.id}`}>
                <Play className="size-5 fill-current" />
                Watch Now
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href={`/${currentItem.mediaType}/${currentItem.id}`}>
                <Info className="size-5" />
                More Info
              </Link>
            </Button>
          </div>
        </div>

        {/* Pagination Dots */}
        {items.length > 1 && (
          <div className="flex items-center gap-2 mt-8">
            {items.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/40 hover:bg-muted-foreground/60",
                )}
              >
                <span className="sr-only">Go to slide {index + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] bg-muted animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-20 h-6 rounded-full bg-muted-foreground/20" />
            <div className="w-12 h-5 rounded bg-muted-foreground/20" />
          </div>
          <div className="w-3/4 h-12 md:h-16 rounded bg-muted-foreground/20" />
          <div className="w-full h-4 rounded bg-muted-foreground/20" />
          <div className="w-2/3 h-4 rounded bg-muted-foreground/20" />
          <div className="flex gap-3 mt-6">
            <div className="w-32 h-11 rounded-md bg-muted-foreground/20" />
            <div className="w-32 h-11 rounded-md bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
