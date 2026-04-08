"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  title: string;
  posterUrl?: string;
  className?: string;
}

export function VideoPlayer({ title, posterUrl, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    alert(
      `Mock Video Player: ${isPlaying ? "Paused" : "Playing"} "${title}"\n\nThis is a mock video player. In production, this would stream the actual video content.`,
    );
  };

  const handleFullscreen = () => {
    alert(
      "Mock Fullscreen: This would enter fullscreen mode in a real implementation.",
    );
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden group",
        className,
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
    >
      {/* Poster/Background */}
      {posterUrl && (
        <img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transition-transform hover:scale-110">
            <Play className="size-10 fill-primary-foreground text-primary-foreground ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            max={100}
            step={1}
            onValueChange={(value) => setProgress(value[0])}
            className="cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlay}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </Button>

            <span className="text-sm text-white/80 ml-2">
              {Math.floor(progress * 1.2)}:00 / 2:00:00
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

            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
            >
              <Maximize className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
