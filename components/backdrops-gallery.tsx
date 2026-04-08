"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackdropUrl } from "@/services/tmdb";
import type { TMDBImage } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface BackdropsGalleryProps {
  backdrops: TMDBImage[];
  title: string;
  className?: string;
}

export function BackdropsGallery({
  backdrops,
  title,
  className,
}: BackdropsGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!backdrops || backdrops.length === 0) return null;

  const displayedBackdrops = backdrops.slice(0, 12);

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex > 0 ? selectedIndex - 1 : displayedBackdrops.length - 1,
    );
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(
      selectedIndex < displayedBackdrops.length - 1 ? selectedIndex + 1 : 0,
    );
  };

  return (
    <div className={cn("", className)}>
      <h3 className="text-xl font-semibold mb-4">Gallery</h3>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayedBackdrops.map((backdrop, index) => (
          <button
            key={backdrop.file_path}
            onClick={() => setSelectedIndex(index)}
            className="relative aspect-video rounded-lg overflow-hidden bg-muted group"
          >
            <img
              src={getBackdropUrl(backdrop.file_path, "w780")}
              alt={`${title} backdrop ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close Button - larger and more visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedIndex(null)}
            className="absolute top-20 right-6 size-12 text-white hover:text-white hover:bg-white/20 z-[70] border border-white/30"
          >
            <X className="size-7" />
            <span className="sr-only">Close gallery</span>
          </Button>

          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 size-12 text-white hover:text-white hover:bg-white/20"
          >
            <ChevronLeft className="size-8" />
            <span className="sr-only">Previous image</span>
          </Button>

          {/* Image */}
          <div
            className="max-w-5xl max-h-[80vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getBackdropUrl(
                displayedBackdrops[selectedIndex].file_path,
                "original",
              )}
              alt={`${title} backdrop ${selectedIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 bottom-1/2 translate-y-1/2 size-12 text-white hover:text-white hover:bg-white/20"
          >
            <ChevronRight className="size-8" />
            <span className="sr-only">Next image</span>
          </Button>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {selectedIndex + 1} / {displayedBackdrops.length}
          </div>
        </div>
      )}
    </div>
  );
}
