import { getImageUrl, isMovie } from "@/services/tmdb";
import { TMDBMovie, TMDBTVShow } from "@/types/tmdb";
import { Star } from "lucide-react";

interface SelectedItemInfoProps {
  tmdbMedia: TMDBMovie | TMDBTVShow;
}

export default function SelectedItemInfo({ tmdbMedia }: SelectedItemInfoProps) {
  const isTV = !isMovie(tmdbMedia);

  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <div className="flex items-start gap-4">
        <div className="w-20 h-28 rounded overflow-hidden bg-muted shrink-0">
          <img
            src={getImageUrl(
              isTV ? tmdbMedia.poster_path : tmdbMedia.poster_path,
              "w154",
            )}
            alt={isTV ? tmdbMedia.name : tmdbMedia.title}
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
            {isTV ? tmdbMedia.name : tmdbMedia.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {tmdbMedia.vote_average > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3 text-yellow-500 fill-yellow-500" />
                {tmdbMedia.vote_average.toFixed(1)}
              </span>
            )}
            {(isTV ? tmdbMedia.first_air_date : tmdbMedia.release_date) && (
              <span>
                {new Date(
                  isTV ? tmdbMedia.first_air_date : tmdbMedia.release_date,
                ).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
