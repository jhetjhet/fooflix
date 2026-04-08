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
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Share this link with friends:\n\n${shareUrl}`);
    }
  };

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
    <div className="min-h-screen">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[30vh] md:h-[40vh]">
        <div className="absolute inset-0">
          <img
            src={getBackdropUrl(movie.backdrop_path, "original")}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href={`/movie/${movieId}`}>
              <ArrowLeft className="size-4" />
              Back to Movie
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Watch Together Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Watch Together</h2>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  Room: <code className="text-primary font-mono">{roomId}</code>
                </span>
                <span>|</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {watcherCount} watching
                </span>
                <span>|</span>
                <span>Role: {isHost ? "Host" : "Joiner"}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleCopyLink} variant="outline" className="gap-2">
            {copied ? (
              <>
                <Check className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="size-4" />
                Share Link
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Video Player */}
          <div className="flex-1 space-y-6 min-w-0">
            <VideoPlayer
              title={movie.title}
              posterUrl={getBackdropUrl(movie.backdrop_path, "w1280")}
            />

            {/* Chat Placeholder */}
            <div className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-semibold mb-3">Live Chat</h3>
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                <p>
                  Mock Chat: Real-time chat would appear here.
                  <br />
                  This is a placeholder for the watch party chat feature.
                </p>
              </div>
            </div>

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
    </div>
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
