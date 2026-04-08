"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/services/tmdb";
import type { TMDBCastMember } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface CastListProps {
  cast: TMDBCastMember[];
  className?: string;
}

export function CastList({ cast, className }: CastListProps) {
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

  if (!cast || cast.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Cast</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll("left")}
            className="rounded-full"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Scroll left</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll("right")}
            className="rounded-full"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Scroll right</span>
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cast.slice(0, 20).map((member) => (
          <div key={member.id} className="flex-shrink-0 w-[120px] text-center">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden bg-muted mb-2">
              {member.profile_path ? (
                <img
                  src={getImageUrl(member.profile_path, "w185")}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="size-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-1">{member.name}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {member.character}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
