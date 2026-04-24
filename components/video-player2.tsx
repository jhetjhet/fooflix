"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import ReactPlayer from "react-player";
import type { ReactPlayerProps, Config } from "react-player/types";
import {
  Maximize,
  Minimize2,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Imperative handle ───────────────────────────────────────────────────────

export interface VideoPlayer2Handle {
  /** Pauses or resumes playback. Pass true to pause, false to play. */
  setPaused: (paused: boolean) => void;
  /** Seeks to the given time in seconds. */
  seekTo: (time: number) => void;
  /** Sets the playback rate. */
  setPlaybackRate: (rate: number) => void;
  /** Returns the current playback position in seconds. */
  getCurrentTime: () => number;
  /** Returns the total duration in seconds. */
  getDuration: () => number;
  /** Returns true if the video is currently paused. */
  isPaused: () => boolean;
  /** Backward-compatible alias for seekTo. */
  seek: (time: number) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VideoPlayer2Props {
  // Our own props
  title: string;
  posterUrl?: string;
  className?: string;

  // ReactPlayer – playback state
  src?: ReactPlayerProps["src"];
  playing?: ReactPlayerProps["playing"];
  muted?: ReactPlayerProps["muted"];
  volume?: ReactPlayerProps["volume"];
  playbackRate?: ReactPlayerProps["playbackRate"];
  loop?: ReactPlayerProps["loop"];
  pip?: ReactPlayerProps["pip"];

  // ReactPlayer – preview / light mode
  light?: ReactPlayerProps["light"];
  playIcon?: ReactPlayerProps["playIcon"];

  // ReactPlayer – player config
  config?: Config;

  // ReactPlayer – callbacks
  onReady?: ReactPlayerProps["onReady"];
  onStart?: ReactPlayerProps["onStart"];
  onPlay?: ReactPlayerProps["onPlay"];
  onPause?: ReactPlayerProps["onPause"];
  onEnded?: ReactPlayerProps["onEnded"];
  onError?: ReactPlayerProps["onError"];
  onProgress?: ReactPlayerProps["onProgress"];
  onPlaying?: ReactPlayerProps["onPlaying"];
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onDurationChange?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  /** Called when the user manually seeks via the progress bar, with the target time in seconds. */
  onSeek?: (time: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VideoPlayer2 = forwardRef<VideoPlayer2Handle, VideoPlayer2Props>(function VideoPlayer2Internal({
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
}: VideoPlayer2Props, ref: React.ForwardedRef<VideoPlayer2Handle>) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Imperative handle ─────────────────────────────────────────────────────
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

  // ── Sync external playing prop ─────────────────────────────────────────────
  useEffect(() => {
    if (playingProp !== undefined) setIsPlaying(playingProp);
  }, [playingProp]);

  useEffect(() => {
    if (playbackRateProp !== undefined) {
      setCurrentPlaybackRate(playbackRateProp);
    }
  }, [playbackRateProp]);

  // ── Fullscreen change listener ─────────────────────────────────────────────
  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ── Cleanup timers on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current)
        clearTimeout(hideControlsTimerRef.current);
      if (clickTimerRef.current)
        clearTimeout(clickTimerRef.current);
    };
  }, []);

  // ── Controls auto-hide ─────────────────────────────────────────────────────
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

  // ── Play / Pause ───────────────────────────────────────────────────────────
  const handlePlayPause = () => setIsPlaying((prev) => !prev);

  // ── Click (single = play/pause, double = fullscreen) ──────────────────────
  const handlePlayerClick = () => {
    if (clickTimerRef.current) return; // double-click is handling it
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

  // ── Mute / Volume ──────────────────────────────────────────────────────────
  const handleMuteToggle = () => setIsMuted((prev) => !prev);

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setCurrentVolume(vol);
    setIsMuted(vol === 0);
  };

  // ── Seek ───────────────────────────────────────────────────────────────────
  const handleProgressChange = (value: number[]) => {
    const video = playerRef.current;
    if (!video) return;
    const seekTo = (value[0] / 100) * (video.duration || 0);
    video.currentTime = seekTo;
    setProgress(value[0]);
    setCurrentTime(seekTo);
    onSeek?.(seekTo);
  };

  // ── Time / Duration sync from native video events ──────────────────────────
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

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const dur = e.currentTarget.duration;
    if (isFinite(dur) && dur > 0) setDuration(dur);
    onDurationChange?.(e);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const dur = e.currentTarget.duration;
    if (isFinite(dur) && dur > 0) setDuration(dur);
  };

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // ── Forwarded callbacks (internal state sync + external notification) ───────
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
    onPlaying?.(e);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (  // eslint-disable-line
    <div
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden group",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* React Player – only mount when a valid src is provided */}
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

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Play icon – visual only, interaction handled by capture area */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="size-10 fill-primary-foreground text-primary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* Controls – z-20 so they sit above the click-capture area */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 z-20",
          showControls ? "opacity-100" : "opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
            </Button>

            {/* Mute toggle + volume slider */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isMuted || currentVolume === 0 ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </Button>
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : currentVolume]}
                min={0}
                max={1}
                step={0.02}
                onValueChange={handleVolumeChange}
                className="cursor-pointer"
              />
            </div>

            {/* Time label */}
            <span className="text-sm text-white/80 ml-2 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 mr-2">{title}</span>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
            >
              <Settings className="size-5" />
            </Button>

            {/* Fullscreen toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize2 className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer2.displayName = "VideoPlayer2";
