"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FileUploader from "@/components/media-uploader";
import { FlixSubtitle, FlixSubtitleForm } from "@/types/flix";
import SubtitleSection from "./subtitle-selection";
import VideoUpload, { ExistingVideo } from "./video-upload";
import {
  deleteFlixSubtitle,
  updateFlixSubtitle,
  uploadFlixSubtitle,
} from "@/app/actions/flix";
import { toast } from "@/hooks/use-toast";
import { UnifiedEpisode, UnifiedMovie } from "@/types/unified";
import { isUnifiedEpisode } from "@/services/unified";
import useConfig from "@/hooks/use-config";

type SubtitleChanges = {
  added: FlixSubtitleForm[];
  removed: FlixSubtitleForm[];
  updated: FlixSubtitleForm[];
};

function subtitlesEqual(a: FlixSubtitleForm[], b: FlixSubtitleForm[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, i) => {
    const other = b[i];
    return (
      item.name === other.name &&
      item.is_default === other.is_default &&
      item.srclng === other.srclng &&
      !(item.subtitle instanceof File) &&
      item.subtitle === other.subtitle
    );
  });
}

export type UploaderState = {
  bytesUploaded: number | null;
  pause: boolean;
  percentProgress: number;
  isInitializing: boolean;
  setPause: React.Dispatch<React.SetStateAction<boolean>>;
  cancelUpload: () => void;
};

interface UploadFormProps {
  mediaData: UnifiedMovie | UnifiedEpisode | null;
  subtitle?: string;
  tmdbId?: string;
  className?: string;
  onClose?: () => void;
  onVideoUploadFinish?: () => void;
  onNewSubtitles?: (subtitles: FlixSubtitleForm[]) => void;
}

export function UploadForm({
  mediaData,
  subtitle,
  tmdbId = "",
  className,
  onClose,
  onVideoUploadFinish,
  onNewSubtitles,
}: UploadFormProps) {
  const isEpisode = isUnifiedEpisode(mediaData);
  const title = isEpisode
    ? `S${String(mediaData.season_number).padStart(2, "0")}E${String(mediaData.episode_number).padStart(2, "0")} - ${mediaData.name}`
    : mediaData?.title || "Upload Media";
  const seasonNumber = isEpisode ? mediaData.season_number : null;
  const episodeNumber = isEpisode ? mediaData.episode_number : null;

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<FlixSubtitleForm[]>([]);
  const [savedSubtitles, setSavedSubtitles] = useState<FlixSubtitleForm[]>([]);
  const [showUpload, setShowUpload] = useState(() => !mediaData?.has_video);

  const [isSubtUploadPending, startSubtUploadTransition] = useTransition();
  const config = useConfig();

  const isDirty = useMemo(
    () => !subtitlesEqual(subtitles, savedSubtitles),
    [subtitles, savedSubtitles],
  );

  const changedSubtitles = useMemo<SubtitleChanges>(() => {
    const savedMap = new Map(savedSubtitles.map((s) => [s.id, s]));
    const currentMap = new Map(subtitles.map((s) => [s.id, s]));

    const added = subtitles.filter((s) => !savedMap.has(s.id));
    const removed = savedSubtitles.filter((s) => !currentMap.has(s.id));
    const updated = subtitles.filter((s) => {
      const saved = savedMap.get(s.id);
      if (!saved) return false;
      return (
        s.name !== saved.name ||
        s.is_default !== saved.is_default ||
        s.srclng !== saved.srclng ||
        s.subtitle instanceof File ||
        s.subtitle !== saved.subtitle
      );
    });

    return { added, removed, updated };
  }, [subtitles, savedSubtitles]);

  const addSubtitle = () => {
    setSubtitles((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "English",
        srclng: "en",
        is_default: prev.length === 0,
      },
    ]);
  };

  const removeSubtitle = (id: string) => {
    setSubtitles((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubtitle = (id: string, updates: Partial<FlixSubtitleForm>) => {
    setSubtitles((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const setDefaultSubtitle = (id: string) => {
    setSubtitles((prev) =>
      prev.map((s) => ({ ...s, is_default: s.id === id })),
    );
  };

  const onSave = () => {
    const newSubs = (changedSubtitles.added ?? []).map((s) => ({
      ...s,
      __old_id: s.id,
    }));

    if (newSubs.some((s) => !(s.subtitle instanceof File))) {
      toast({
        title: "Subtitle file missing",
        description: "All new subtitles must have a file attached.",
        variant: "destructive",
      });
      return;
    }

    startSubtUploadTransition(async () => {
      const addPromises = newSubs.map((s) =>
        uploadFlixSubtitle(tmdbId, s, episodeNumber, seasonNumber),
      );

      const updatePromises = changedSubtitles.updated.map((s) =>
        updateFlixSubtitle(tmdbId, s.id, s, episodeNumber, seasonNumber),
      );

      const removePromises = changedSubtitles.removed.map((s) =>
        deleteFlixSubtitle(tmdbId, s.id, episodeNumber, seasonNumber),
      );

      // Run all in parallel
      const [addResults, updateResults] = await Promise.all([
        Promise.all(addPromises),
        Promise.all(updatePromises),
        Promise.all(removePromises),
      ]);

      // Build lookup maps in one pass
      const addSuccess = new Map<string, FlixSubtitle>();
      addResults.forEach((res, i) => {
        if (res.ok) addSuccess.set(newSubs[i].__old_id, res.data);
      });

      const updateSuccess = new Map<string, FlixSubtitle>();
      updateResults.forEach((res, i) => {
        if (res.ok) {
          updateSuccess.set(changedSubtitles.updated[i].id, res.data);
        }
      });

      // Single pass transform
      const newSubtitles = subtitles.map((s) => {
        const match = addSuccess.get(s.id) || updateSuccess.get(s.id);
        if (!match) return s;

        return {
          ...s,
          id: match.id.toString(),
          subtitle: match.subtitle_exists ? match.subtitle : undefined,
        };
      });

      onNewSubtitles?.(newSubtitles);
    });
  };

  useEffect(() => {
    setShowUpload(!mediaData?.has_video);

    const subsForm: FlixSubtitleForm[] =
      mediaData?.subtitles?.map((s) => ({
        id: s.id.toString(),
        name: s.name,
        srclng: s.srclng,
        is_default: s.is_default,
        subtitle: s.subtitle_exists ? s.subtitle : undefined,
      })) ?? [];

    setSubtitles(subsForm);
    setSavedSubtitles(subsForm);
  }, [mediaData]);

  useEffect(() => {
    setVideoFile(null);
  }, [tmdbId, seasonNumber, episodeNumber]);

  return (
    <div
      className={cn("p-6 rounded-lg bg-card border border-border", className)}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
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
            basePath={config?.nodeApiUrl}
            onFinish={() => onVideoUploadFinish?.()}
          >
            {(uploaderState: UploaderState) => (
              <VideoUpload
                key={tmdbId + seasonNumber + episodeNumber} // reset state when media changes
                file={videoFile}
                onChange={setVideoFile}
                uploaderState={videoFile ? uploaderState : null}
                onStartPause={() => uploaderState.setPause((p: boolean) => !p)}
                onCancel={
                  mediaData?.has_video ? () => setShowUpload(false) : undefined
                }
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
      {isDirty && (
        <div className="mt-3 flex justify-end">
          <Button onClick={onSave} disabled={isSubtUploadPending}>
            {isSubtUploadPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
}
