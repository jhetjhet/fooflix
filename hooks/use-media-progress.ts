import { recordMediaProgress } from "@/app/actions/flix";
import { VideoPlayer2Handle } from "@/components/video-player2";
import { MediaProgress } from "@/types/flix";
import { useCallback, useRef } from "react";

const LOCAL_PROGRESS_STORAGE_KEY = "fooflix:media-progress";
const MAX_LOCAL_PROGRESS_RECORDS = 10;

type MediaRecordType = "movie" | "episode";
type ProgressInput = Omit<MediaProgress, "last_watched_at">;

interface LocalProgressRecord extends ProgressInput {
  media_id: string;
  media_type: MediaRecordType;
  last_watched_at: string;
  last_recorded_at: number;
}

function toProgressPercent(progressData: ProgressInput): number {
  if (
    !Number.isFinite(progressData.duration_seconds) ||
    progressData.duration_seconds <= 0
  ) {
    return 0;
  }

  return (progressData.progress_seconds / progressData.duration_seconds) * 100;
}

function isLocalProgressRecord(value: unknown): value is LocalProgressRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return (
    (record.media_type === "movie" || record.media_type === "episode") &&
    typeof record.media_id === "string" &&
    typeof record.progress_seconds === "number" &&
    typeof record.duration_seconds === "number" &&
    typeof record.is_finished === "boolean" &&
    typeof record.last_position_seconds === "number" &&
    typeof record.last_watched_at === "string" &&
    typeof record.last_recorded_at === "number"
  );
}

function readLocalProgressRecords(): LocalProgressRecord[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(LOCAL_PROGRESS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLocalProgressRecord);
  } catch {
    return [];
  }
}

function writeLocalProgressRecords(records: LocalProgressRecord[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      LOCAL_PROGRESS_STORAGE_KEY,
      JSON.stringify(records),
    );
  } catch {
    // Ignore storage failures quietly to avoid interrupting playback events.
  }
}

function upsertLocalProgressRecord(
  mediaType: MediaRecordType,
  mediaId: string,
  progressData: ProgressInput,
): LocalProgressRecord {
  const now = Date.now();
  const record: LocalProgressRecord = {
    media_id: mediaId,
    media_type: mediaType,
    progress_seconds: progressData.progress_seconds,
    duration_seconds: progressData.duration_seconds,
    is_finished: progressData.is_finished,
    last_position_seconds: progressData.last_position_seconds,
    last_watched_at: new Date(now).toISOString(),
    last_recorded_at: now,
  };

  const existing = readLocalProgressRecords();
  const next = existing.filter(
    (item) => !(item.media_id === mediaId && item.media_type === mediaType),
  );
  next.push(record);

  const capped = next
    .sort((a, b) => b.last_recorded_at - a.last_recorded_at)
    .slice(0, MAX_LOCAL_PROGRESS_RECORDS);

  writeLocalProgressRecords(capped);
  return record;
}

export default function useMediaProgress(
  videoRef: React.RefObject<VideoPlayer2Handle | null> | null = null,
  useLocalStorage: boolean = false,
  delayUpdateInterval: number = 3000,
  progressThresholdPercent: number = 10,
) {
  const lastUpdateAtRef = useRef(0);

  const applyConstraints = useCallback(
    (progressData: ProgressInput) => {
      const threshold = Math.max(0, progressThresholdPercent);
      const delayMs = Math.max(0, delayUpdateInterval);

      if (toProgressPercent(progressData) < threshold) {
        return false;
      }

      const now = Date.now();
      if (now - lastUpdateAtRef.current < delayMs) {
        return false;
      }

      lastUpdateAtRef.current = now;
      return true;
    },
    [delayUpdateInterval, progressThresholdPercent],
  );

  const updateProgress = async (
    mediaType: MediaRecordType,
    mediaId: string,
    progressData: ProgressInput,
  ) => {
    if (!applyConstraints(progressData)) {
      return;
    }

    if (useLocalStorage) {
      return upsertLocalProgressRecord(mediaType, mediaId, progressData);
    }

    try {
      return await recordMediaProgress(mediaType, mediaId, progressData);
    } catch {
      return;
    }
  };

  const buildProgressData = (
    progressSeconds: number,
    durationSeconds: number,
  ): ProgressInput => ({
    progress_seconds: progressSeconds,
    duration_seconds: durationSeconds,
    is_finished:
      durationSeconds > 0 ? progressSeconds / durationSeconds >= 0.95 : false,
    last_position_seconds: progressSeconds,
  });

  const updateProgressByVideoEvent = async (
    mediaType: MediaRecordType,
    mediaId: string,
    videoElement: HTMLVideoElement,
  ) => {
    const dur = videoElement.duration;
    const cur = videoElement.currentTime;

    if (isFinite(dur) && dur > 0) {
      return await updateProgress(
        mediaType,
        mediaId,
        buildProgressData(cur, dur),
      );
    }
  };

  const record = useCallback(
    async (mediaType: MediaRecordType, mediaId: string) => {
      const player = videoRef?.current;

      if (!player) return;

      const progressSeconds = player.getCurrentTime() ?? 0;
      const durationSeconds = player.getDuration() ?? 0;

      return await updateProgress(
        mediaType,
        mediaId,
        buildProgressData(progressSeconds, durationSeconds),
      );
    },
    [videoRef, updateProgress],
  );

  const getLocalProgressRecords = useCallback(() => {
    return readLocalProgressRecords();
  }, []);

  const getLocalProgressRecord = useCallback(
    (mediaType: MediaRecordType, mediaId: string) => {
      const records = readLocalProgressRecords();
      return records.find(
        (record) =>
          record.media_type === mediaType && record.media_id === mediaId,
      );
    },
    [],
  );

  return {
    updateProgress,
    updateProgressByVideoEvent,
    record,
    getLocalProgressRecords,
    getLocalProgressRecord,
  };
}
