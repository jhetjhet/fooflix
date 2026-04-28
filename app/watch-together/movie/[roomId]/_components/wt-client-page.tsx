"use client";

import { getBackdropUrl } from "@/services/tmdb";
import { UnifiedMovie } from "@/types/unified";
import useWTControls from "@/hooks/use-wt-controls";
import { VideoPlayer2, VideoPlayer2Handle } from "@/components/video-player2";
import { useEffect, useRef } from "react";
import { WTEventDataSchema, WTRoom } from "@/types/watch-together";
import { useAuthContext } from "@/context/authentication";
import WTPlayerLock from "@/components/media-page/wt-player-lock";
import useWTStatus from "@/hooks/use-wt-status";
import WTPageContainer from "./wt-page-container";

interface WTClientPageProps {
  movie: UnifiedMovie;
  roomDetails: WTRoom;
}

export default function WTClientPage({
  movie,
  roomDetails,
}: WTClientPageProps) {
  const { user } = useAuthContext();
  const vidPlayerRef = useRef<VideoPlayer2Handle>(null);
  const lastSyncTimeRef = useRef(0);

  const {
    syncState,
    eventState,
    users,
    userLeft,
    newUser,
  } = useWTControls(roomDetails.roomId);

  const {
    hasUserInteracted,
    showOverlay,
    overlayMessage,
    showJoinButton,
    doManualPlay,
  } = useWTStatus(syncState, userLeft, newUser);

  useEffect(() => {
    if (!syncState) return;

    const eventRes = WTEventDataSchema.safeParse(syncState);

    if (!eventRes.success) {
      console.error("Invalid event data:", eventRes.error);
      return;
    }

    const { time = 0, serverTime = 0, isPlaying } = eventRes.data;

    lastSyncTimeRef.current = serverTime;

    const now = Date.now();
    const latencyMs = now - serverTime!;
    const projectedTime = isPlaying ? time + latencyMs / 1000 : time;

    const localTime = vidPlayerRef.current?.getCurrentTime() || 0;
    const drift = projectedTime - localTime;

    if (Math.abs(drift) < 0.3) {
      // ignore (natural variation)
    } else if (Math.abs(drift) < 1.5) {
      // smooth correction
      vidPlayerRef.current?.setPlaybackRate(drift > 0 ? 1.05 : 0.95);
    } else {
      // big desync → hard seek
      vidPlayerRef.current?.seekTo(projectedTime);
    }

    if (hasUserInteracted) {
      vidPlayerRef.current?.setPaused(!isPlaying);
    }
  }, [syncState, hasUserInteracted]);

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
    } else if (type === "pause") {
      vidPlayerRef.current?.setPaused(true);
    } else if (type === "seek") {
      const { time = 0 } = eventRes.data;

      vidPlayerRef.current?.seekTo(time);
    }
  }, [eventState]);

  useEffect(() => {
    vidPlayerRef.current?.setPaused(showOverlay);
  }, [showOverlay]);

  return (
    <WTPageContainer
      roomDetails={roomDetails}
      movie={movie}
      user={user}
      users={users}
    >
      <WTPlayerLock
        showOverlay={showOverlay}
        overlayMessage={overlayMessage}
        showJoinButton={showJoinButton}
        onJoin={doManualPlay}
      >
        <VideoPlayer2
          ref={vidPlayerRef}
          title={movie.title}
          playbackRate={1}
          posterUrl={getBackdropUrl(movie.backdrop_path, "w1280")}
          src={movie.video_url || undefined}
          isLimited
        />
      </WTPlayerLock>
    </WTPageContainer>
  );
}
