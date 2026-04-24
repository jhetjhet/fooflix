"use client";

/**
 * PlayerControls — bottom control bar for VideoPlayer2.
 * Renders the progress slider, play/pause, mute/volume, time display,
 * the Settings menu, and the fullscreen toggle.
 */

import { FastForward, Maximize, Minimize2, Pause, Play, Rewind, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { FlixSubtitle } from "@/types/flix";
import { cn } from "@/lib/utils";
import { formatTime } from "./utils";
import { SettingsMenu } from "./settings-menu";

interface PlayerControlsProps {
  showControls: boolean;

  // Progress
  progress: number;
  onProgressChange: (value: number[]) => void;

  // Playback
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;

  // Volume
  isMuted: boolean;
  currentVolume: number;
  onMuteToggle: () => void;
  onVolumeChange: (value: number[]) => void;

  // Time
  currentTime: number;
  duration: number;

  // Title
  title: string;

  // Settings
  currentPlaybackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isPip: boolean;
  onPipToggle: () => Promise<void>;
  subtitles: FlixSubtitle[];
  activeCaption: number | null;
  onCaptionChange: (idStr: string) => void;

  // Fullscreen
  isFullscreen: boolean;
  onFullscreen: () => void;
}

export function PlayerControls({
  showControls,
  progress,
  onProgressChange,
  isPlaying,
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  isMuted,
  currentVolume,
  onMuteToggle,
  onVolumeChange,
  currentTime,
  duration,
  title,
  currentPlaybackRate,
  onPlaybackRateChange,
  isPip,
  onPipToggle,
  subtitles,
  activeCaption,
  onCaptionChange,
  isFullscreen,
  onFullscreen,
}: PlayerControlsProps) {
  return (
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
          onValueChange={onProgressChange}
          className="cursor-pointer"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Skip backward 10 s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipBackward}
            className="text-white hover:text-white hover:bg-white/20"
          >
            <Rewind className="size-5" />
          </Button>

          {/* Play / Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="text-white hover:text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </Button>

          {/* Skip forward 10 s */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            className="text-white hover:text-white hover:bg-white/20"
          >
            <FastForward className="size-5" />
          </Button>

          {/* Mute toggle + volume slider */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMuteToggle}
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
              onValueChange={onVolumeChange}
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

          {/* Settings dropdown */}
          <SettingsMenu
            currentPlaybackRate={currentPlaybackRate}
            onPlaybackRateChange={onPlaybackRateChange}
            isPip={isPip}
            onPipToggle={onPipToggle}
            subtitles={subtitles}
            activeCaption={activeCaption}
            onCaptionChange={onCaptionChange}
          />

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
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
  );
}
