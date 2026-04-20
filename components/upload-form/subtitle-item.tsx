import { Subtitle } from "@/types/tmdb";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { subtitleLanguages } from "@/lib/mock-data";


interface SubtitleItemProps {
  sub: Subtitle;
  onUpdate: (id: string, updates: Partial<Subtitle>) => void;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function SubtitleItem({ sub, onUpdate, onSetDefault, onRemove }: SubtitleItemProps) {
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