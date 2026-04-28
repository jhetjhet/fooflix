"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaCard, MediaCardSkeleton } from "@/components/media-card";
import type { MediaItem } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  title: string;
  items: MediaItem[];
  isLoading?: boolean;
  className?: string;
}

export function MediaCarousel({
  title,
  items,
  isLoading = false,
  className,
}: MediaCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={cn("relative", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 md:px-0">
        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>

        {/* Navigation Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full"
          >
            <ChevronLeft className="size-5" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full"
          >
            <ChevronRight className="size-5" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Gradient */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

        {/* Right Gradient */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MediaCardSkeleton
                  key={i}
                  className="w-[140px] md:w-[180px] lg:w-[200px]"
                />
              ))
            : items.map((item) => (
                <MediaCard
                  key={`${item.mediaType}-${item.id}`}
                  item={item}
                  className="w-[140px] md:w-[180px] lg:w-[200px]"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
