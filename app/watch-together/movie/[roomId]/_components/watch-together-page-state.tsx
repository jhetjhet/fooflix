"use client";

import {
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { CastList } from "@/components/cast-list";
import { getBackdropUrl } from "@/services/tmdb";
import { useAuth } from "@/hooks/use-auth";
import WatchTogetherHeader from "@/components/media-page/watch-together-header";
import { UnifiedMovie } from "@/types/unified";

interface WatchTogetherMoviePageProps {
  movie: UnifiedMovie;
  shareUrl: string;
}

export default function WatchTogetherMoviePageState({
  movie,
  shareUrl,
}: WatchTogetherMoviePageProps) {
  const { isLoggedIn, user } = useAuth();

  const watcherCount = 0;

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-10">
      {/* Watch Together Header */}
      <WatchTogetherHeader
        roomId={"test-room-id"}
        watcherCount={1}
        isHost={false}
        shareUrl={shareUrl}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Video Player */}
        <div className="flex-1 space-y-6 min-w-0">
          <VideoPlayer
            title={movie.title}
            posterUrl={getBackdropUrl(movie.backdrop_path, "w1280")}
          />

          {/* Cast */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <CastList cast={movie.credits.cast} />
          )}
        </div>

        {/* Right Column - Info */}
        <div className="lg:w-80 shrink-0 space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold">{movie.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {movie.vote_average > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
            )}

            {movie.runtime > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" />
                <span>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </span>
              </div>
            )}

            {movie.release_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Overview */}
          <div>
            <h3 className="font-semibold mb-2">Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
              {movie.overview || "No overview available."}
            </p>
          </div>

          {/* Viewers List (Mock) */}
          <div className="pt-4 border-t border-border">
            <h3 className="font-semibold mb-3">Viewers ({watcherCount})</h3>
            <div className="flex flex-wrap gap-2">
              {isLoggedIn && user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{user.name} (You)</span>
                  <span className="text-xs text-primary">Host</span>
                </div>
              )}
              {Array.from({
                length: Math.max(0, watcherCount - 1),
              }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-muted-foreground/30" />
                  <span>Guest {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

