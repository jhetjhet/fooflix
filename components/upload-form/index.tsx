"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subtitle } from "@/types/tmdb";
import { cn } from "@/lib/utils";
import FileUploader from "@/components/media-uploader";
import { FlixMedia } from "@/types/flix";
import SubtitleSection from "./subtitle-selection";
import VideoUpload, { ExistingVideo } from "./video-upload";

export type UploaderState = {
  bytesUploaded: number | null;
  pause: boolean;
  percentProgress: number;
  isInitializing: boolean;
  setPause: React.Dispatch<React.SetStateAction<boolean>>;
  cancelUpload: () => void;
};

interface UploadFormProps {
  title: string;
  mediaData: FlixMedia | null;
  subtitle?: string;
  tmdbId?: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  className?: string;
  onClose?: () => void;
  onVideoUploadFinish?: () => void;
}

export function UploadForm({
  title,
  mediaData,
  subtitle,
  tmdbId = "",
  seasonNumber = null,
  episodeNumber = null,
  className,
  onClose,
  onVideoUploadFinish,
}: UploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [showUpload, setShowUpload] = useState(() => !mediaData?.has_video);

  const addSubtitle = () => {
    setSubtitles((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", language: "en", isDefault: prev.length === 0 },
    ]);
  };

  const removeSubtitle = (id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubtitle = (id: string, updates: Partial<Subtitle>) => {
    setSubtitles((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const setDefaultSubtitle = (id: string) => {
    setSubtitles((prev) => prev.map((s) => ({ ...s, isDefault: s.id === id })));
  };

  useEffect(() => {
    setShowUpload(!mediaData?.has_video);
  }, [mediaData]);

  useEffect(() => {
    setVideoFile(null);
    setSubtitles([]);
  }, [tmdbId, seasonNumber, episodeNumber]);

  return (
    <div className={cn("p-6 rounded-lg bg-card border border-border", className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {!showUpload && mediaData?.has_video ? (
          <ExistingVideo
            videoPath={mediaData.video_path}
            onReplace={() => setShowUpload(true)}
          />
        ) : (
          <FileUploader
            _file={videoFile}
            tmdbId={tmdbId}
            seasonNumber={seasonNumber}
            episodeNumber={episodeNumber}
            basePath={process.env.NEXT_PUBLIC_NODE_ENDPOINT}
            onFinish={() => onVideoUploadFinish?.()}
          >
            {(uploaderState: UploaderState) => (
              <VideoUpload
                key={tmdbId + seasonNumber + episodeNumber} // reset state when media changes
                file={videoFile}
                onChange={setVideoFile}
                uploaderState={videoFile ? uploaderState : null}
                onStartPause={() => uploaderState.setPause((p: boolean) => !p)}
              />
            )}
          </FileUploader>
        )}
        <SubtitleSection
          subtitles={subtitles}
          onAdd={addSubtitle}
          onUpdate={updateSubtitle}
          onSetDefault={setDefaultSubtitle}
          onRemove={removeSubtitle}
        />
      </div>
    </div>
  );
}
