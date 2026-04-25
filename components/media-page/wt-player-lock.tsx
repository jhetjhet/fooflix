"use client";

import { Button } from "../ui/button";
import { VideoPlayer2 } from "../video-player2";

type WTPlayerLockProps = {
  children: React.ReactElement<typeof VideoPlayer2>;
  showOverlay?: boolean;
  overlayMessage?: string;
  showJoinButton?: boolean;
  onJoin?: () => void;
};

export default function WTPlayerLock({
  children,
  showOverlay,
  overlayMessage,
  showJoinButton,
  onJoin,
}: WTPlayerLockProps) {
  return (
    <div className="relative">
      {children}
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 z-100 bg-black/50"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="w-full flex p-4">
            {overlayMessage && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                {overlayMessage}
              </p>
            )}

            {showJoinButton && <Button className="ml-auto" onClick={() => onJoin?.()}>Join</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
