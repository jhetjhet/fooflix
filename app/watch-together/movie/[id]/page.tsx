"use client";

import { use, useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Users,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/video-player";
import { CastList } from "@/components/cast-list";
import { getMovieDetails, getBackdropUrl } from "@/services/tmdb";
import { generateRoomId } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import type { TMDBMovieDetails } from "@/types/tmdb";
import WatchTogetherHeader from "@/components/media-page/watch-together-header";
import MediaPageContainer from "@/components/media-page/container";

interface WatchTogetherMoviePageProps {
  params: Promise<{ id: string }>;
}

export default function WatchTogetherMoviePage({
  params,
}: WatchTogetherMoviePageProps) {
  const { id } = use(params);
  const movieId = parseInt(id);
  const { isLoggedIn, user } = useAuth();

  const [roomId] = useState(() => generateRoomId());
  const [watcherCount, setWatcherCount] = useState(1);
  const [isHost] = useState(true);

  const {
    data: movie,
    isLoading,
    error,
  } = useSWR<TMDBMovieDetails>(`movie-${movieId}`, () =>
    getMovieDetails(movieId),
  );

  // Simulate random watcher count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setWatcherCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        return Math.max(1, Math.min(newCount, 15));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/watch-together/movie/${movieId}?room=${roomId}`
      : "";

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Movie not found</h1>
          <p className="text-muted-foreground mb-4">
            The movie you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !movie) {
    return <WatchTogetherSkeleton />;
  }

  return (
    <MediaPageContainer
      title={movie.title}
      backdropPath={movie.backdrop_path}
      backLink={{ href: "/", label: "Back to Home" }}
    >
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Watch Together Header */}
        <WatchTogetherHeader
          roomId={roomId}
          watcherCount={watcherCount}
          isHost={isHost}
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
    </MediaPageContainer>
  );
}

function WatchTogetherSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative h-[30vh] md:h-[40vh] bg-muted animate-pulse" />
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <Skeleton className="h-24 rounded-lg mb-6" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <div className="lg:w-80 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
