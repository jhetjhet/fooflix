/**
 * Formats a duration in seconds to a human-readable string.
 * Examples: 65 → "1:05", 3723 → "1:02:03"
 */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Available playback speed options shown in the Settings menu. */
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
