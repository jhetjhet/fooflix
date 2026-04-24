"use client";

/**
 * VideoPlayer2 — the main player component.
 *
 * Wraps ReactPlayer with a full custom control surface. Manages all playback
 * state internally, exposes an imperative ref API (VideoPlayer2Handle) for
 * programmatic control (seek, rate, pause), and forwards callbacks to consumers.
 */

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import ReactPlayer from "react-player";
import { Play } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { VideoPlayer2Handle, VideoPlayer2Props } from "./types";
import { PlayerControls } from "./controls";

export const VideoPlayer2 = forwardRef<VideoPlayer2Handle, VideoPlayer2Props>(
  function VideoPlayer2Internal(
    {
      title,
      posterUrl,
      className,

      src,
      playing: playingProp,
      muted: mutedProp,
      volume: volumeProp,
      playbackRate: playbackRateProp,
      loop,
      pip,
      light,
      playIcon,
      config,

      onReady,
      onStart,
      onPlay,
      onPause,
      onEnded,
      onError,
      onProgress,
      onPlaying,
      onTimeUpdate: onTimeUpdateProp,
      onDurationChange,
      onSeek,
      subtitles = [],
    }: VideoPlayer2Props,
    ref: React.ForwardedRef<VideoPlayer2Handle>,
  ) {
    const playerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Imperative handle ───────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      setPaused: (paused: boolean) => setIsPlaying(!paused),
      seekTo: (time: number) => {
        const video = playerRef.current;
        if (!video || !Number.isFinite(time)) return;
        video.currentTime = time;
        setCurrentTime(time);
        const dur = video.duration;
        if (isFinite(dur) && dur > 0) setProgress((time / dur) * 100);
      },
      setPlaybackRate: (rate: number) => {
        if (!Number.isFinite(rate) || rate <= 0) return;
        setCurrentPlaybackRate(rate);
      },
      getCurrentTime: () => playerRef.current?.currentTime ?? 0,
      getDuration: () => playerRef.current?.duration ?? 0,
      isPaused: () => playerRef.current?.paused ?? true,
      seek: (time: number) => {
        const video = playerRef.current;
        if (!video || !Number.isFinite(time)) return;
        video.currentTime = time;
        setCurrentTime(time);
        const dur = video.duration;
        if (isFinite(dur) && dur > 0) setProgress((time / dur) * 100);
      },
    }));

    const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const clickTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    const [isPlaying, setIsPlaying] = useState(playingProp ?? false);
    const [isMuted, setIsMuted] = useState(mutedProp ?? false);
    const [currentVolume, setCurrentVolume] = useState(volumeProp ?? 1);
    const [currentPlaybackRate, setCurrentPlaybackRate] = useState(
      playbackRateProp ?? 1,
    );
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isPip, setIsPip] = useState(false);
    const [activeCaption, setActiveCaption] = useState<number | null>(
      () => subtitles.find((s) => s.is_default)?.id ?? null,
    );

    // ── Sync external props ─────────────────────────────────────────────────
    useEffect(() => {
      if (playingProp !== undefined) setIsPlaying(playingProp);
    }, [playingProp]);

    useEffect(() => {
      if (playbackRateProp !== undefined) setCurrentPlaybackRate(playbackRateProp);
    }, [playbackRateProp]);

    // ── Fullscreen change listener ──────────────────────────────────────────
    useEffect(() => {
      const handleFullscreenChange = () =>
        setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () =>
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    // ── Cleanup timers on unmount ───────────────────────────────────────────
    useEffect(() => {
      return () => {
        if (hideControlsTimerRef.current)
          clearTimeout(hideControlsTimerRef.current);
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      };
    }, []);

    // ── Controls auto-hide ──────────────────────────────────────────────────
    const scheduleHideControls = () => {
      if (hideControlsTimerRef.current)
        clearTimeout(hideControlsTimerRef.current);
      hideControlsTimerRef.current = setTimeout(
        () => setShowControls(false),
        3000,
      );
    };

    const handleMouseMove = () => {
      setShowControls(true);
      if (isPlaying) scheduleHideControls();
    };

    const handleMouseLeave = () => {
      if (isPlaying) setShowControls(false);
    };

    // ── Playback ────────────────────────────────────────────────────────────
    const handlePlayPause = () => setIsPlaying((prev) => !prev);

    // ── Click / double-click ────────────────────────────────────────────────
    const handlePlayerClick = () => {
      if (clickTimerRef.current) return;
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        handlePlayPause();
      }, 250);
    };

    const handlePlayerDoubleClick = () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      handleFullscreen();
    };

    // ── Volume ──────────────────────────────────────────────────────────────
    const handleMuteToggle = () => setIsMuted((prev) => !prev);

    const handleVolumeChange = (value: number[]) => {
      const vol = value[0];
      setCurrentVolume(vol);
      setIsMuted(vol === 0);
    };

    // ── Seek ────────────────────────────────────────────────────────────────
    const handleProgressChange = (value: number[]) => {
      const video = playerRef.current;
      if (!video) return;
      const seekTo = (value[0] / 100) * (video.duration || 0);
      video.currentTime = seekTo;
      setProgress(value[0]);
      setCurrentTime(seekTo);
      onSeek?.(seekTo);
    };

    // ── Time / Duration ─────────────────────────────────────────────────────
    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget;
      const dur = video.duration;
      const cur = video.currentTime;
      setCurrentTime(cur);
      if (isFinite(dur) && dur > 0) {
        setDuration(dur);
        setProgress((cur / dur) * 100);
      }
      onTimeUpdateProp?.(e);
    };

    const handleDurationChange = (
      e: React.SyntheticEvent<HTMLVideoElement>,
    ) => {
      const dur = e.currentTarget.duration;
      if (isFinite(dur) && dur > 0) setDuration(dur);
      onDurationChange?.(e);
    };

    const handleLoadedMetadata = (
      e: React.SyntheticEvent<HTMLVideoElement>,
    ) => {
      const dur = e.currentTarget.duration;
      if (isFinite(dur) && dur > 0) setDuration(dur);
    };

    // ── Fullscreen ──────────────────────────────────────────────────────────
    const handleFullscreen = () => {
      const container = containerRef.current;
      if (!container) return;
      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    // ── Native video event forwarders ───────────────────────────────────────
    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsPlaying(true);
      onPlay?.(e);
    };

    const handlePause = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsPlaying(false);
      onPause?.(e);
    };

    const handleEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsPlaying(false);
      onEnded?.(e);
    };

    const handlePlaying = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      setIsBuffering(false);
      onPlaying?.(e);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    // ── PiP ─────────────────────────────────────────────────────────────────
    const handlePipToggle = async () => {
      const video = playerRef.current;
      if (!video) return;
      try {
        if (!document.pictureInPictureElement) {
          await video.requestPictureInPicture();
          setIsPip(true);
        } else {
          await document.exitPictureInPicture();
          setIsPip(false);
        }
      } catch {
        // PiP not supported or permission denied
      }
    };

    // ── Captions ────────────────────────────────────────────────────────────
    const handleCaptionChange = (idStr: string) => {
      const id = idStr === "off" ? null : Number(idStr);
      setActiveCaption(id);
      const video = playerRef.current;
      if (!video) return;
      Array.from(video.textTracks).forEach((track, i) => {
        track.mode = subtitles[i]?.id === id ? "showing" : "hidden";
      });
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full aspect-video bg-black rounded-lg overflow-hidden group",
          className,
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {src ? (
          <ReactPlayer
            ref={playerRef}
            src={src}
            playing={isPlaying}
            muted={isMuted}
            volume={currentVolume}
            playbackRate={currentPlaybackRate}
            loop={loop}
            pip={pip}
            light={light}
            playIcon={playIcon}
            config={config}
            poster={posterUrl}
            width="100%"
            height="100%"
            style={{ position: "absolute", inset: 0 }}
            onReady={onReady}
            onStart={onStart}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={onError}
            onProgress={onProgress}
            onPlaying={handlePlaying}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        )}

        {/* Click / double-click capture area */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handlePlayerClick}
          onDoubleClick={handlePlayerDoubleClick}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Buffering spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <Spinner className="size-10 text-white/80" />
          </div>
        )}

        {/* Play icon overlay — shown when paused and not buffering */}
        {!isPlaying && !isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="size-10 fill-primary-foreground text-primary-foreground ml-1" />
            </div>
          </div>
        )}

        {/* Bottom controls bar */}
        <PlayerControls
          showControls={showControls}
          progress={progress}
          onProgressChange={handleProgressChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          isMuted={isMuted}
          currentVolume={currentVolume}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
          currentTime={currentTime}
          duration={duration}
          title={title}
          currentPlaybackRate={currentPlaybackRate}
          onPlaybackRateChange={setCurrentPlaybackRate}
          isPip={isPip}
          onPipToggle={handlePipToggle}
          subtitles={subtitles}
          activeCaption={activeCaption}
          onCaptionChange={handleCaptionChange}
          isFullscreen={isFullscreen}
          onFullscreen={handleFullscreen}
        />
      </div>
    );
  },
);

VideoPlayer2.displayName = "VideoPlayer2";
