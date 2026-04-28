"use client";

import { getBackdropUrl } from "@/services/tmdb";
import { UnifiedMovie } from "@/types/unified";
import useWTControls from "@/hooks/use-wt-controls";
import { VideoPlayer2, VideoPlayer2Handle } from "@/components/video-player2";
import { useEffect, useRef } from "react";
import { WTEventData, WTEventType, WTRoom } from "@/types/watch-together";
import { useAuthContext } from "@/context/authentication";
import WTPageContainer from "./wt-page-container";

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

  const { 
    roomState, 
    users,
    socketSyncRequesterId,
    emitWTEvent,
  } = useWTControls(roomDetails.roomId);

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
    <WTPageContainer
      roomDetails={roomDetails}
      movie={movie}
      user={user}
      users={users}
    >
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
    </WTPageContainer>
  )
}

