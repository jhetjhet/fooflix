import { cn } from "@/lib/utils";
import { UploaderState } from ".";
import { Film, Pause, Play, Trash2, Upload } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";

interface ExistingVideoProps {
  videoPath: string;
  onReplace: () => void;
}

export function ExistingVideo({ videoPath, onReplace }: ExistingVideoProps) {
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

interface VideoUploadProps {
  file: File | null;
  onChange: (file: File) => void;
  uploaderState: UploaderState | null;
  onStartPause: () => void;
  onCancel?: () => void;
}

export default function VideoUpload({ file, onChange, uploaderState, onStartPause, onCancel }: VideoUploadProps) {
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

      {onCancel && !uploaderState && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onCancel}
        >
          Keep existing video
        </Button>
      )}

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