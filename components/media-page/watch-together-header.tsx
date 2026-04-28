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
    <div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:items-center">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <Users className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold sm:text-lg">
              Watch Together
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
              <span className="min-w-0">
                Room: <code className="break-all font-mono text-primary">{roomId}</code>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {watcherCount} watching
              </span>
              <span className="hidden sm:inline">|</span>
              <span>Role: {isHost ? "Host" : "Joiner"}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="w-full gap-2 sm:w-auto"
        >
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
    </div>
  );
}
