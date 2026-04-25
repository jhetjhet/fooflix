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
import { WTEventData, WTEventType, WTRoom } from "@/types/watch-together";
import { useAuthContext } from "@/context/authentication";
import ViewersList from "@/components/media-page/viewers-list";
import useWTUserHydrates from "@/hooks/use-wt-user-hydrates";

interface WTHostPageProps {
  movie: UnifiedMovie;
  roomDetails: WTRoom;
}

export default function WTHostPage({
  movie,
  roomDetails,
}: WTHostPageProps) {
  const { user } = useAuthContext();
  const vidPlayerRef = useRef<VideoPlayer2Handle>(null);

  const [shareUrl, setShareUrl] = useState("");

  const { 
    roomState, 
    users,
    socketSyncRequesterId,
    emitWTEvent,
  } = useWTControls(roomDetails.roomId);

  const {
    isLoading,
    hydratedUsers: wtUsers,
  } = useWTUserHydrates(users, user);
  
  const userCount = users?.length || 0;

  const performWTAction = (type: WTEventType, time: number, isPlaying: boolean) => {
    const eventData: WTEventData = {
      roomId: roomDetails.roomId,
      time,
      isPlaying,
      serverTime: Date.now(),
    };

    emitWTEvent(type, eventData);
  }

  useEffect(() => {
    if (!roomDetails?.roomId || !socketSyncRequesterId) return;

    emitWTEvent("sync", {
      roomId: roomDetails.roomId,
      time: vidPlayerRef.current?.getCurrentTime() ?? 0,
      isPlaying: !vidPlayerRef.current?.isPaused(),
      serverTime: Date.now(),
      isRequest: true,
      targetSocketId: socketSyncRequesterId,
    });
  }, [socketSyncRequesterId]);

  useEffect(() => {
    if (!roomDetails?.roomId) return;

    setShareUrl(`${window.location.origin}/watch-together/movie/${roomDetails.roomId}`);
  }, [roomDetails?.roomId]);

  useEffect(() => {
    if (!roomState || !vidPlayerRef.current) return;

    const interval = setInterval(() => {
      emitWTEvent("sync", {
        roomId: roomDetails.roomId,
        time: vidPlayerRef.current?.getCurrentTime() ?? 0,
        isPlaying: !vidPlayerRef.current?.isPaused(),
        serverTime: Date.now(),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [roomState, vidPlayerRef.current]);

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
            onSeek={(time) => performWTAction("seek", time, !vidPlayerRef.current?.isPaused())}
            onPlay={() => performWTAction("play", vidPlayerRef.current?.getCurrentTime() ?? 0, true)}
            onPause={() => performWTAction("pause", vidPlayerRef.current?.getCurrentTime() ?? 0, false)}
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
          <ViewersList 
            userCount={userCount}
            users={wtUsers}
            user={user}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

