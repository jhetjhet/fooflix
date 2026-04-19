import { getImageUrl } from "@/services/tmdb";
import { isUnifiedSeries } from "@/services/unified";
import { UnifiedMovie, UnifiedSeries } from "@/types/unified";
import { Star } from "lucide-react";

interface FlixFormMediaBaseProps {
  unifiedMedia: UnifiedMovie | UnifiedSeries;
}

export default function FlixFormMediaBase({
  unifiedMedia,
}: FlixFormMediaBaseProps) {
  const isTV = isUnifiedSeries(unifiedMedia);

  return (
    <div className="relative p-4 rounded-lg bg-card border border-border">
      <div className="flex items-start gap-4">
        <div className="w-20 h-28 rounded overflow-hidden bg-muted shrink-0">
          <img
            src={getImageUrl(
              isTV ? unifiedMedia.poster_path : unifiedMedia.poster_path,
              "w154",
            )}
            alt={isTV ? unifiedMedia.name : unifiedMedia.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary text-primary-foreground uppercase">
              {isTV ? "Series" : "Movie"}
            </span>
          </div>
          <h3 className="text-lg font-semibold line-clamp-2">
            {isTV ? unifiedMedia.name : unifiedMedia.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {unifiedMedia.vote_average > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3 text-yellow-500 fill-yellow-500" />
                {unifiedMedia.vote_average.toFixed(1)}
              </span>
            )}
            {(isTV
              ? unifiedMedia.first_air_date
              : unifiedMedia.release_date) && (
              <span>
                {new Date(
                  isTV
                    ? unifiedMedia.first_air_date
                    : unifiedMedia.release_date,
                ).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
