"use client";

/**
 * SettingsMenu — dropdown for VideoPlayer2 settings.
 * Exposes playback speed selection, Picture-in-Picture toggle,
 * and caption track selection (only rendered when subtitles are provided).
 */

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FlixSubtitle } from "@/types/flix";
import { PLAYBACK_SPEEDS } from "./utils";

interface SettingsMenuProps {
  currentPlaybackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isPip: boolean;
  onPipToggle: () => Promise<void>;
  subtitles: FlixSubtitle[];
  activeCaption: number | null;
  onCaptionChange: (idStr: string) => void;
}

export function SettingsMenu({
  currentPlaybackRate,
  onPlaybackRateChange,
  isPip,
  onPipToggle,
  subtitles,
  activeCaption,
  onCaptionChange,
}: SettingsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-white/20"
        >
          <Settings className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        className="min-w-44"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Playback Speed */}
        <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={String(currentPlaybackRate)}
          onValueChange={(v) => onPlaybackRateChange(Number(v))}
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <DropdownMenuRadioItem key={speed} value={String(speed)}>
              {speed === 1 ? "Normal" : `${speed}×`}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Picture in Picture */}
        <DropdownMenuCheckboxItem
          checked={isPip}
          onCheckedChange={onPipToggle}
          disabled={!document.pictureInPictureEnabled}
        >
          Picture in Picture
        </DropdownMenuCheckboxItem>

        {/* Captions — only shown when subtitle tracks are available */}
        {subtitles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Captions</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeCaption === null ? "off" : String(activeCaption)}
              onValueChange={onCaptionChange}
            >
              <DropdownMenuRadioItem value="off">Off</DropdownMenuRadioItem>
              {subtitles.map((sub) => (
                <DropdownMenuRadioItem key={sub.id} value={String(sub.id)}>
                  {sub.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
