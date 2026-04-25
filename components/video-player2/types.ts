import type React from "react";
import type { ReactPlayerProps, Config } from "react-player/types";
import type { FlixSubtitle } from "@/types/flix";

/**
 * Imperative handle for VideoPlayer2, accessible via ref.
 * Provides programmatic control over playback, seeking, and playback rate.
 */
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

/**
 * Props for the VideoPlayer2 component.
 */
export interface VideoPlayer2Props {
  // Our own props
  title: string;
  posterUrl?: string;
  className?: string;
  subtitles?: FlixSubtitle[];
  /** When true, hides seek/playback controls and disables their shortcuts. Only volume, captions, PiP, and fullscreen remain. */
  isLimited?: boolean;

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
