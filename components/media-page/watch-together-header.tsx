import { Check, Share2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

type WatchTogetherHeaderProps = {
  roomId: string;
  watcherCount: number;
  isHost: boolean;
  shareUrl: string;
};

export default function WatchTogetherHeader({
  roomId,
  watcherCount,
  isHost,
  shareUrl,
}: WatchTogetherHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Share this link with friends:\n\n${shareUrl}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Users className="size-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Watch Together</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Room: <code className="text-primary font-mono">{roomId}</code>
            </span>
            <span>|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {watcherCount} watching
            </span>
            <span>|</span>
            <span>Role: {isHost ? "Host" : "Joiner"}</span>
          </div>
        </div>
      </div>

      <Button onClick={handleCopyLink} variant="outline" className="gap-2">
        {copied ? (
          <>
            <Check className="size-4" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="size-4" />
            Share Link
          </>
        )}
      </Button>
    </div>
  );
}
