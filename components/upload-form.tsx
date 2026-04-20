"use client";

import { useEffect, useState } from "react";
import { Upload, Plus, Trash2, X, Play, Pause, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subtitleLanguages } from "@/lib/mock-data";
import type { Subtitle } from "@/types/tmdb";
import { cn } from "@/lib/utils";
import FileUploader from "@/components/media-uploader";
import { FlixMedia } from "@/types/flix";

type UploaderState = {
  bytesUploaded: number | null;
  pause: boolean;
  percentProgress: number;
  isInitializing: boolean;
  setPause: React.Dispatch<React.SetStateAction<boolean>>;
  cancelUpload: () => void;
};

// ─── Existing Video ─────────────────────────────────────────────────────────

interface ExistingVideoProps {
  videoPath: string;
  onReplace: () => void;
}

function ExistingVideo({ videoPath, onReplace }: ExistingVideoProps) {
  const filename = videoPath.split("/").pop() || videoPath;
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Video File</label>
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-primary/5 border-primary/30">
        <div className="flex items-center justify-center size-10 rounded-md bg-primary/10 shrink-0">
          <Film className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{filename}</p>
          <p className="text-xs text-muted-foreground">Video already uploaded</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReplace} className="shrink-0">
          Replace
        </Button>
      </div>
    </div>
  );
}

// ─── Video Upload ────────────────────────────────────────────────────────────

interface VideoUploadProps {
  file: File | null;
  onChange: (file: File) => void;
  uploaderState: UploaderState | null;
  onStartPause: () => void;
}

function VideoUpload({ file, onChange, uploaderState, onStartPause }: VideoUploadProps) {
  const isUploading = !!uploaderState && !uploaderState.pause && uploaderState.bytesUploaded !== null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Video File</label>
      <div className="relative">
        <input
          type="file"
          accept="video/*"
          disabled={isUploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        <div
          className={cn(
            "flex items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg transition-colors",
            file
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
        >
          <Upload className="size-8 text-muted-foreground" />
          <div className="text-center">
            {file ? (
              <>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Click or drag to upload</p>
                <p className="text-sm text-muted-foreground">
                  MP4, MKV, AVI up to 10GB
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {file && uploaderState && (
        <div className="flex items-center gap-3 pt-1">
          <Progress value={uploaderState.percentProgress} className="flex-1" />
          <span className="text-xs tabular-nums text-muted-foreground w-9 shrink-0 text-right">
            {uploaderState.percentProgress}%
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 shrink-0"
            disabled={uploaderState.isInitializing}
            onClick={onStartPause}
          >
            {uploaderState.pause ? (
              <>
                <Play className="size-3.5" />
                Start
              </>
            ) : (
              <>
                <Pause className="size-3.5" />
                Pause
              </>
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="gap-1.5 shrink-0"
            disabled={uploaderState.isInitializing}
            onClick={uploaderState.cancelUpload}
          >
            <Trash2 className="size-3.5" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Subtitle Item ───────────────────────────────────────────────────────────

interface SubtitleItemProps {
  sub: Subtitle;
  onUpdate: (id: string, updates: Partial<Subtitle>) => void;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

function SubtitleItem({ sub, onUpdate, onSetDefault, onRemove }: SubtitleItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`default-${sub.id}`}
          checked={sub.isDefault}
          onCheckedChange={() => onSetDefault(sub.id)}
        />
        <label
          htmlFor={`default-${sub.id}`}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Default
        </label>
      </div>

      <Input
        placeholder="Subtitle name"
        value={sub.name}
        onChange={(e) => onUpdate(sub.id, { name: e.target.value })}
        className="flex-1"
      />

      <Select
        value={sub.language}
        onValueChange={(value) => onUpdate(sub.id, { language: value })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {subtitleLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <input
          type="file"
          accept=".srt,.vtt,.ass,.ssa"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpdate(sub.id, { file, name: sub.name || file.name.replace(/\.[^/.]+$/, "") });
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button variant="outline" size="sm">
          {sub.file ? "Change" : "Upload"}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(sub.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

// ─── Subtitle Section ────────────────────────────────────────────────────────

interface SubtitleSectionProps {
  subtitles: Subtitle[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Subtitle>) => void;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

function SubtitleSection({ subtitles, onAdd, onUpdate, onSetDefault, onRemove }: SubtitleSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Subtitles</label>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="size-4" />
          Add Subtitle
        </Button>
      </div>

      {subtitles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          No subtitles added yet
        </p>
      ) : (
        <div className="space-y-3">
          {subtitles.map((sub) => (
            <SubtitleItem
              key={sub.id}
              sub={sub}
              onUpdate={onUpdate}
              onSetDefault={onSetDefault}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upload Form ─────────────────────────────────────────────────────────────

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
