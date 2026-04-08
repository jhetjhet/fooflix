"use client";

import { useState } from "react";
import { Upload, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

interface UploadFormProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  className?: string;
}

export function UploadForm({
  title,
  subtitle,
  onClose,
  className,
}: UploadFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const addSubtitle = () => {
    const newSubtitle: Subtitle = {
      id: Date.now().toString(),
      name: "",
      language: "en",
      isDefault: subtitles.length === 0,
    };
    setSubtitles([...subtitles, newSubtitle]);
  };

  const removeSubtitle = (id: string) => {
    setSubtitles(subtitles.filter((s) => s.id !== id));
  };

  const updateSubtitle = (id: string, updates: Partial<Subtitle>) => {
    setSubtitles(
      subtitles.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const setDefaultSubtitle = (id: string) => {
    setSubtitles(
      subtitles.map((s) => ({
        ...s,
        isDefault: s.id === id,
      })),
    );
  };

  const handleSubmit = (action: "register" | "update" | "delete") => {
    const actionText =
      action === "register"
        ? "Register"
        : action === "update"
          ? "Update"
          : "Delete";

    alert(
      `Mock ${actionText}:\n\n` +
        `Title: ${title}\n` +
        `Video: ${videoFile?.name || "No video selected"}\n` +
        `Subtitles: ${subtitles.length} track(s)\n\n` +
        `This would ${action} the content in the database.`,
    );
  };

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
        {/* Video Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Video File</label>
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div
              className={cn(
                "flex items-center justify-center gap-3 p-8 border-2 border-dashed rounded-lg transition-colors",
                videoFile
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
              )}
            >
              <Upload className="size-8 text-muted-foreground" />
              <div className="text-center">
                {videoFile ? (
                  <>
                    <p className="font-medium">{videoFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
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
        </div>

        {/* Subtitles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Subtitles</label>
            <Button
              variant="outline"
              size="sm"
              onClick={addSubtitle}
              className="gap-1.5"
            >
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
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`default-${sub.id}`}
                      checked={sub.isDefault}
                      onCheckedChange={() => setDefaultSubtitle(sub.id)}
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
                    onChange={(e) =>
                      updateSubtitle(sub.id, {
                        name: e.target.value,
                      })
                    }
                    className="flex-1"
                  />

                  <Select
                    value={sub.language}
                    onValueChange={(value) =>
                      updateSubtitle(sub.id, {
                        language: value,
                      })
                    }
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
                        if (file) {
                          updateSubtitle(sub.id, {
                            file,
                            name:
                              sub.name || file.name.replace(/\.[^/.]+$/, ""),
                          });
                        }
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
                    onClick={() => removeSubtitle(sub.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
          <Button onClick={() => handleSubmit("register")} className="gap-2">
            Register Content
          </Button>
          <Button variant="outline" onClick={() => handleSubmit("update")}>
            Update Content
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleSubmit("delete")}
            className="ml-auto"
          >
            Delete Content
          </Button>
        </div>
      </div>
    </div>
  );
}
