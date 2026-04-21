import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { FlixSubtitleForm } from "@/types/flix";
import { useRef, useState } from "react";
import ISO6391 from "iso-639-1";

interface SubtitleItemProps {
  sub: FlixSubtitleForm;
  onUpdate: (id: string, updates: Partial<FlixSubtitleForm>) => void;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
  subtitleOptions?: { value: string; label: string }[];
}

export default function SubtitleItem({
  sub,
  onUpdate,
  onSetDefault,
  onRemove,
  subtitleOptions = [],
}: SubtitleItemProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const subtitleFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Checkbox
          id={`default-${sub.id}`}
          checked={sub.is_default}
          onCheckedChange={() => onSetDefault(sub.id)}
        />
        <label
          htmlFor={`default-${sub.id}`}
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Default
        </label>
      </div>

      <Select
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
        value={sub.srclng}
        onValueChange={(value) => {
          const name = ISO6391.getName(value);
          
          onUpdate(sub.id, { srclng: value, name });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {!isSelectOpen && (
            <SelectItem value={sub.srclng}>
              {sub.name} ({sub.srclng})
            </SelectItem>
          )}

          {isSelectOpen && subtitleOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative ml-auto">
        <input
          hidden
          ref={subtitleFileRef}
          type="file"
          accept=".srt,.vtt,.ass,.ssa"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file)
              onUpdate(sub.id, {
                subtitle: file,
                name: sub.name,
              });
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => subtitleFileRef.current?.click()}
        >
          {sub.subtitle ? "Change" : "Upload"}
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
