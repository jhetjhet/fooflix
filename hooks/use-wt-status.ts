import { WTEventData, WTUserEvent } from "@/types/watch-together";
import { useEffect, useRef, useState } from "react";

type WTViewerState =
  | "idle"              // no session yet
  | "waiting_for_sync"  // joined but no sync yet
  | "locked"            // synced, but host controlling
  | "desynced"          // lost sync
  | "host_left"         // no host
  | "ready_to_join";    // user must manually start

type WTStatusReturn = {
  hasUserInteracted: boolean;
  showOverlay: boolean;
  overlayMessage: string;
  showJoinButton: boolean;
  doManualPlay: () => void;
}

export default function useWTStatus(
  syncState: WTEventData | null,
  userLeft: WTUserEvent | null,
  newUser: WTUserEvent | null,
): WTStatusReturn {
  const [state, setState] = useState<WTViewerState>("idle");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Sync handling
  useEffect(() => {
    if (!syncState) return;

    if (!hasUserInteracted) {
      setState("ready_to_join");
      return;
    }

    setState("locked");
  }, [syncState, hasUserInteracted]);

  // Host leaves
  useEffect(() => {
    if (userLeft?.isHost) {
      setState("host_left");
    }
  }, [userLeft]);

  // Host joins back
  useEffect(() => {
    if (newUser?.isHost) {
      setState(hasUserInteracted ? "locked" : "ready_to_join");
    }
  }, [newUser, hasUserInteracted]);

  const doManualPlay = () => {
    setHasUserInteracted(true);
    setState("waiting_for_sync");
  };

  // Derived UI
  const showOverlay = state !== "locked";

  const overlayMessageMap: Record<WTViewerState, string> = {
    idle: "Joining session...",
    waiting_for_sync: "Syncing with host...",
    ready_to_join: "Tap to join and start playback",
    locked: "",
    desynced: "Re-syncing with host...",
    host_left: "Host left the session",
  };

  return {
    hasUserInteracted,
    showOverlay,
    overlayMessage: overlayMessageMap[state],
    showJoinButton: state === "ready_to_join",
    doManualPlay,
  };
}