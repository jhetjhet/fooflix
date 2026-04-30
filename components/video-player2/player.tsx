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
import { FastForward, Pause, Play, Rewind } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { VideoPlayer2Handle, VideoPlayer2Props } from "./types";
import { PlayerControls } from "./controls";
import { useIsMobile } from "@/hooks/use-mobile";

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
      isLimited = false,
    }: VideoPlayer2Props,
    ref: React.ForwardedRef<VideoPlayer2Handle>,
  ) {
    const playerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

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
    const lastTapRef = useRef<number>(0);

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
    const [activeCueText, setActiveCueText] = useState<string | null>(null);

    // ── Subtitle elevation ──────────────────────────────────────────────────
    // Adjust these two values to reposition subtitles in each controls state.
    const SUBTITLE_BOTTOM_CONTROLS_VISIBLE_PX = 96; // just above the controls bar
    const SUBTITLE_BOTTOM_CONTROLS_HIDDEN_PX = 16;  // near bottom when controls are hidden
    const subtitleBottom = showControls
      ? SUBTITLE_BOTTOM_CONTROLS_VISIBLE_PX
      : SUBTITLE_BOTTOM_CONTROLS_HIDDEN_PX;

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
    const cueChangeCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      return () => {
        if (hideControlsTimerRef.current)
          clearTimeout(hideControlsTimerRef.current);
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        cueChangeCleanupRef.current?.();
      };
    }, []);

    // ── Caption track mode helper ───────────────────────────────────────────
    // Call only after video.textTracks is populated (handleLoadedMetadata or
    // handleCaptionChange), never at mount time.
    const applyTextTrackMode = (
      video: HTMLVideoElement,
      id: number | null,
      pipActive = false,
    ) => {
      Array.from(video.textTracks).forEach((track) => {
        const isActive =
          id !== null &&
          subtitles.some(
            (s) =>
              s.id === id &&
              (track.language === s.srclng || track.label === s.name),
          );
        // In PiP: use "showing" so the browser renders native subtitles inside the PiP window.
        // Otherwise: use "hidden" (fires cuechange but no native render — we render ourselves).
        // "disabled" fully deactivates inactive tracks.
        track.mode = isActive ? (pipActive ? "showing" : "hidden") : "disabled";
      });
    };

    // ── Cue change listener ─────────────────────────────────────────────────
    // Attaches a cuechange listener on the active TextTrack so we can render
    // the current cue text as a custom positioned overlay.
    const setupCueListener = (video: HTMLVideoElement, id: number | null) => {
      cueChangeCleanupRef.current?.();
      cueChangeCleanupRef.current = null;
      setActiveCueText(null);

      if (id === null) return;

      const track = Array.from(video.textTracks).find((t) =>
        subtitles.some(
          (s) => s.id === id && (t.language === s.srclng || t.label === s.name),
        ),
      );

      if (!track) return;

      const onCueChange = () => {
        const cue = track.activeCues?.[0] as VTTCue | undefined;
        setActiveCueText(cue?.text ?? null);
      };

      track.addEventListener("cuechange", onCueChange);
      cueChangeCleanupRef.current = () =>
        track.removeEventListener("cuechange", onCueChange);
    };

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

    const skipBy = (delta: number) => {
      const video = playerRef.current;
      if (!video) return;
      const dur = video.duration || 0;
      const newTime = Math.max(0, Math.min(dur, video.currentTime + delta));
      video.currentTime = newTime;
      setCurrentTime(newTime);
      if (isFinite(dur) && dur > 0) setProgress((newTime / dur) * 100);
    };

    const handleSkipBackward = () => skipBy(-10);
    const handleSkipForward = () => skipBy(10);

    // ── Click / double-click (mouse) ────────────────────────────────────────
    const handlePlayerClick = () => {
      if (isLimited) return;

      // Controls hidden → reveal them only; never play/pause on this interaction.
      if (!showControls) {
        setShowControls(true);
        scheduleHideControls();
        return;
      }

      // Controls visible → toggle play/pause.
      // 250 ms guard distinguishes single-click from double-click (fullscreen).
      // On mobile, double-tap is caught in handleTouchEnd with preventDefault,
      // so the click event never fires for double-taps.
      if (clickTimerRef.current) return;
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        handlePlayPause();
        scheduleHideControls();
      }, 250);
    };

    const handlePlayerDoubleClick = () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      handleFullscreen();
    };

    // ── Double-tap (touch) → fullscreen ─────────────────────────────────────
    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double-tap detected — cancel any pending single-tap play/pause
        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
          clickTimerRef.current = null;
        }
        e.preventDefault();
        handleFullscreen();
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
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
      const video = e.currentTarget;
      if (isFinite(video.duration) && video.duration > 0) setDuration(video.duration);
      // textTracks are populated by now — apply caption state and start listening for cues.
      applyTextTrackMode(video, activeCaption, isPip);
      setupCueListener(video, activeCaption);
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
          // Switch active track to "showing" BEFORE opening PiP so the
          // PiP window gets native subtitle rendering from the start.
          applyTextTrackMode(video, activeCaption, true);
          // One-shot listener — fires when PiP closes via any means
          // (our button OR the browser-native close button in the PiP overlay).
          const onLeavePiP = () => {
            video.removeEventListener("leavepictureinpicture", onLeavePiP);
            setIsPip(false);
            // Switch back to "hidden" so the custom overlay takes over again.
            Array.from(video.textTracks).forEach((t) => {
              if (t.mode === "showing") t.mode = "hidden";
            });
          };
          video.addEventListener("leavepictureinpicture", onLeavePiP);
          await video.requestPictureInPicture();
          setIsPip(true);
        } else {
          await document.exitPictureInPicture();
          // leavepictureinpicture event handles setIsPip(false) and track mode reset.
        }
      } catch {
        // PiP not supported or permission denied — revert track mode.
        applyTextTrackMode(video, activeCaption, false);
      }
    };

    // ── Keyboard shortcuts ────────────────────────────────────────────────
    /**
     * Handles keyboard shortcuts when the player container is focused.
     *
     * Space / K  — toggle play/pause
     * F          — toggle fullscreen  (Esc to exit is handled natively by the browser)
     * M          — toggle mute
     * ArrowLeft  — seek back 5 s
     * ArrowRight — seek forward 5 s
     * J          — seek back 10 s  (YouTube-style)
     * L          — seek forward 10 s (YouTube-style)
     * ArrowUp    — volume +10 %
     * ArrowDown  — volume −10 %
     * 0–9        — jump to 0 %–90 % of video duration
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Don't intercept when a child input / select has focus
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const video = playerRef.current;

      const seekBy = (delta: number) => {
        if (!video) return;
        const dur = video.duration || 0;
        const newTime = Math.max(0, Math.min(dur, video.currentTime + delta));
        video.currentTime = newTime;
        setCurrentTime(newTime);
        if (isFinite(dur) && dur > 0) setProgress((newTime / dur) * 100);
      };

      switch (e.key) {
        case " ":
        case "k":
        case "K":
          if (isLimited) break;
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          handleMuteToggle();
          break;
        case "ArrowLeft":
          if (!isLimited) {
            e.preventDefault();
            seekBy(-5);
          }
          break;
        case "ArrowRight":
          if (!isLimited) {
            e.preventDefault();
            seekBy(5);
          }
          break;
        case "j":
        case "J":
          if (!isLimited) {
            e.preventDefault();
            seekBy(-10);
          }
          break;
        case "l":
        case "L":
          if (!isLimited) {
            e.preventDefault();
            seekBy(10);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setCurrentVolume((v) => {
            const next = Math.min(1, Math.round((v + 0.1) * 10) / 10);
            if (next > 0) setIsMuted(false);
            return next;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setCurrentVolume((v) => {
            const next = Math.max(0, Math.round((v - 0.1) * 10) / 10);
            if (next === 0) setIsMuted(true);
            return next;
          });
          break;
        default:
          // 0–9: jump to that tenth of the video
          if (!isLimited && /^[0-9]$/.test(e.key) && video) {
            e.preventDefault();
            const dur = video.duration || 0;
            const newTime = (parseInt(e.key) / 10) * dur;
            video.currentTime = newTime;
            setCurrentTime(newTime);
            if (isFinite(dur) && dur > 0) setProgress((newTime / dur) * 100);
          }
          break;
      }
    };

    // ── Captions ────────────────────────────────────────────────────────────
    const handleCaptionChange = (idStr: string) => {
      const id = idStr === "off" ? null : Number(idStr);
      setActiveCaption(id);
      const video = playerRef.current;
      if (!video) return;
      applyTextTrackMode(video, id, isPip);
      setupCueListener(video, id);
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full aspect-video bg-black rounded-lg overflow-hidden group focus:outline-none",
          className,
        )}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
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
            crossOrigin="anonymous"
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
          >
            {subtitles?.map((track, i) => (
              <track
                key={i}
                kind={'subtitles'}
                src={track.subtitle}
                label={track.name}
                srcLang={track.srclng}
              />
            ))}
          </ReactPlayer>
        ) : (
          posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )
        )}

        {/* Subtitle overlay — slides up when controls are visible, drops to bottom when hidden.
             Hidden in PiP mode because the browser renders native subtitles inside the PiP window. */}
        {activeCueText && !isPip && (
          <div
            className="absolute left-0 right-0 flex justify-center z-30 pointer-events-none px-4 transition-[bottom] duration-300"
            style={{ bottom: subtitleBottom }}
          >
            <span className="bg-black/70 text-white text-sm px-3 py-1 rounded max-w-[80%] text-center whitespace-pre-line leading-snug">
              {activeCueText}
            </span>
          </div>
        )}

        {/* Click / double-click / double-tap capture area */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={handlePlayerClick}
          onDoubleClick={handlePlayerDoubleClick}
          onTouchEnd={handleTouchEnd}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Buffering spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <Spinner className="size-10 text-white/80" />
          </div>
        )}

        {/* Play icon overlay — desktop only; mobile uses the center controls overlay */}
        {!isPlaying && !isBuffering && !isMobile && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="size-10 fill-primary-foreground text-primary-foreground ml-1" />
            </div>
          </div>
        )}

        {/* Mobile center controls — skip backward / play-pause / skip forward */}
        {isMobile && !isLimited && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center gap-6 z-20 pointer-events-none transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0",
            )}
          >
            <button
              type="button"
              className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-black/50 text-white active:scale-95 transition-transform"
              onClick={(e) => { e.stopPropagation(); handleSkipBackward(); }}
            >
              <Rewind className="size-7" />
            </button>
            <button
              type="button"
              className="pointer-events-auto flex items-center justify-center w-16 h-16 rounded-full bg-black/60 text-white active:scale-95 transition-transform"
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
            >
              {isPlaying
                ? <Pause className="size-8 fill-white" />
                : <Play className="size-8 fill-white ml-1" />}
            </button>
            <button
              type="button"
              className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full bg-black/50 text-white active:scale-95 transition-transform"
              onClick={(e) => { e.stopPropagation(); handleSkipForward(); }}
            >
              <FastForward className="size-7" />
            </button>
          </div>
        )}

        {/* Bottom controls bar */}
        <PlayerControls
          showControls={showControls}
          progress={progress}
          onProgressChange={handleProgressChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSkipBackward={handleSkipBackward}
          onSkipForward={handleSkipForward}
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
          isLimited={isLimited}
        />
      </div>
    );
  },
);

VideoPlayer2.displayName = "VideoPlayer2";
