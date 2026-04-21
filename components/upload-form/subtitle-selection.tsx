import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import SubtitleItem from "./subtitle-item";
import { FlixSubtitleForm } from "@/types/flix";
import ISO6391 from "iso-639-1";

const LANGUAGE_OPTIONS = ISO6391.getAllCodes().map((code) => ({
  value: code,
  label: `${code} - ${ISO6391.getName(code)}`,
}));

interface SubtitleSectionProps {
  subtitles: FlixSubtitleForm[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<FlixSubtitleForm>) => void;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function SubtitleSection({ subtitles, onAdd, onUpdate, onSetDefault, onRemove }: SubtitleSectionProps) {
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
              subtitleOptions={LANGUAGE_OPTIONS}
            />
          ))}
        </div>
      )}
    </div>
  );
}