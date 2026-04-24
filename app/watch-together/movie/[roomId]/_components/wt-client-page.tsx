"use client";

import {
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { CastList } from "@/components/cast-list";
import { getBackdropUrl } from "@/services/tmdb";
import WatchTogetherHeader from "@/components/media-page/watch-together-header";
import { UnifiedMovie } from "@/types/unified";
import useWTControls from "@/hooks/use-wt-controls";
import { VideoPlayer2, VideoPlayer2Handle } from "@/components/video-player2";
import { useEffect, useRef, useState } from "react";
import { WTEventDataSchema, WTRoom } from "@/types/watch-together";
import { useAuthContext } from "@/context/authentication";

interface WTClientPageProps {
  movie: UnifiedMovie;
  roomDetails: WTRoom;
}

export default function WTClientPage({
  movie,
  roomDetails,
}: WTClientPageProps) {
  const { isLoggedIn, user } = useAuthContext();
  const vidPlayerRef = useRef<VideoPlayer2Handle>(null);

  const [shareUrl, setShareUrl] = useState("");

  const { 
    syncState,
    eventState, 
    roomState, 
    userCount,
  } = useWTControls(roomDetails.roomId);

  useEffect(() => {
    if (!roomDetails?.roomId) return;

    setShareUrl(`${window.location.origin}/watch-together/movie/${roomDetails.roomId}`);
  }, [roomDetails?.roomId]);

  useEffect(() => {
    if (!syncState) return;

    const eventRes = WTEventDataSchema.safeParse(syncState);

    if (!eventRes.success) {
      console.error("Invalid event data:", eventRes.error);
      return;
    }

    const { time = 0, serverTime = 0, isPlaying } = eventRes.data;


    const now = Date.now();
    const latencyMs = now - serverTime!;
    const projectedTime = isPlaying ? time + latencyMs / 1000 : time;

    const localTime = vidPlayerRef.current?.getCurrentTime() || 0;
    const drift = projectedTime - localTime;

    if (Math.abs(drift) < 0.3) {
      // ignore (natural variation)
    }
    else if (Math.abs(drift) < 1.5) {
      // smooth correction
      vidPlayerRef.current?.setPlaybackRate(drift > 0 ? 1.05 : 0.95);
    }
    else {
      // big desync → hard seek
      vidPlayerRef.current?.seekTo(projectedTime);
    }

    vidPlayerRef.current?.setPaused(!isPlaying);

    console.log("Calculated latency:", latencyMs, "ms", projectedTime, "drift:", drift);
  }, [syncState]);

  useEffect(() => {
    if (!eventState) return;

    const eventRes = WTEventDataSchema.safeParse(eventState?.data);

    if (!eventRes.success) {
      console.error("Invalid event data:", eventRes.error);
      return;
    }

    const type = eventState?.type;

    if (type === "play") {
      vidPlayerRef.current?.setPaused(false);
    }
    else if (type === "pause") {
      vidPlayerRef.current?.setPaused(true);
    }
    else if (type === "seek") {
      const { time = 0 } = eventRes.data;
      console.log("Seeking to:", time);
      vidPlayerRef.current?.seekTo(time);
    }
  }, [eventState]);

  useEffect(() => {
    console.log("Room State Changed:", roomState);
  }, [roomState]);

  return (
    <div className="container mx-auto px-4 -mt-20 relative z-10">
      {/* Watch Together Header */}
      <WatchTogetherHeader
        roomId={roomDetails.roomId}
        watcherCount={userCount}
        isHost={roomDetails.isHost}
        shareUrl={shareUrl}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Video Player */}
        <div className="flex-1 space-y-6 min-w-0">
          <VideoPlayer2
            ref={vidPlayerRef}
            title={movie.title}
            playbackRate={1}
            posterUrl={getBackdropUrl(movie.backdrop_path, "w1280")}
            src={movie.video_url || undefined}
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
            <h3 className="font-semibold mb-3">Viewers ({userCount})</h3>
            <div className="flex flex-wrap gap-2">
              {isLoggedIn && user && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm">
                  <span>{user.username} (You)</span>
                </div>
              )}
              {Array.from({
                length: userCount,
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

