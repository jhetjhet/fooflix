"use client";

import {
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FileUploaderHandle {
  setPause: React.Dispatch<React.SetStateAction<boolean>>;
  cancelUpload: () => void;
}

export interface FileUploaderRenderState {
  bytesUploaded: number | null;
  pause: boolean;
  percentProgress: number;
  isInitializing: boolean;
  setPause: React.Dispatch<React.SetStateAction<boolean>>;
  cancelUpload: () => void;
}

export interface FileUploaderProps {
  _file: File | null;
  children: (state: FileUploaderRenderState) => React.ReactNode;
  cookieNameId?: string;
  tmdbId?: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  onFinish?: () => void;
  chunkSize?: number;
  parallelism?: number;
  basePath?: string;
}

interface ResumeState {
  alreadyUploaded: number;
  completedParts: number[];
}

interface UploadStateResponse {
  uploaded?: number;
  completedParts?: number[];
}

interface FinalizeBody {
  filename: string;
  tmdb_id: string;
  season_number?: number;
  episode_number?: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

// ─── Component ─────────────────────────────────────────────────────────────

function FileUploader(
  {
    _file,
    children,
    cookieNameId = "",
    tmdbId = "",
    seasonNumber = null,
    episodeNumber = null,
    onFinish = () => {},
    chunkSize = 1048576 * 5,
    parallelism = 5,
    basePath = "",
  }: FileUploaderProps,
) {
    const [bytesUploaded, setBytesUploaded] = useState<number | null>(null);
    const [chunkID, setChunkID] = useState<string | undefined>(undefined);
    const [file, setFile] = useState<File | null>(null);
    const [pause, setPause] = useState(true);
    const [percentProgress, setPercentProgress] = useState(0);
    const [isInitializing, setIsInitializing] = useState(false);

    // Refs used inside async callbacks to avoid stale closures.
    const storageKeyRef = useRef<string | undefined>(undefined);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isRunningRef = useRef(false);
    const resumeStateRef = useRef<ResumeState>({ alreadyUploaded: 0, completedParts: [] });

    const init = async (f: File) => {
      setIsInitializing(true);
      try {
        const rawKey = `${f.name}-${f.lastModified}-${f.size}${cookieNameId ? `-${cookieNameId}` : ""}`;
        const storageKey = stringToHash(rawKey).toString();
        let chunkid = localStorage.getItem(storageKey);

        if (!chunkid) {
          chunkid = crypto.randomUUID();
          localStorage.setItem(storageKey, chunkid);
        }

        // Fetch existing upload state for resume.
        let alreadyUploaded = 0;
        let completedParts: number[] = [];
        try {
          const resp = await axios.get<UploadStateResponse>(`${basePath}/upload/${chunkid}/`);
          alreadyUploaded = resp.data.uploaded ?? 0;
          completedParts = resp.data.completedParts ?? [];
        } catch {
          // No existing upload — start fresh.
        }

        storageKeyRef.current = storageKey;
        resumeStateRef.current = { alreadyUploaded, completedParts };
        setChunkID(chunkid);
        setBytesUploaded(alreadyUploaded);
      } finally {
        setIsInitializing(false);
      }
    };

    const doFinish = () => {
      if (storageKeyRef.current) {
        localStorage.removeItem(storageKeyRef.current);
      }
      setFile(null);
      setPause(true);
      setBytesUploaded(null);
      isRunningRef.current = false;
      onFinish();
    };

    const abortCurrentUpload = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };

    const cancelUpload = () => {
      abortCurrentUpload();
      const id = chunkID;
      doFinish();
      if (id) {
          axios.delete(`${basePath}/upload/cancel/${id}/`)
          .catch((err) => console.error(err))
          .finally(() => {
            setBytesUploaded(null);
            setChunkID(undefined);
            setPercentProgress(0);
          });
      }
    };

    useEffect(() => {
      if (!_file) return;
      setFile(_file);
      init(_file);
    }, [_file, cookieNameId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (!file || bytesUploaded === null) {
        setPercentProgress(0);
        return;
      }
      setPercentProgress(Math.round((bytesUploaded / file.size) * 100));
    }, [bytesUploaded, file]);

    // Main parallel upload effect. Fires when unpaused with all required state ready.
    // Uses a worker-pool pattern: `parallelism` concurrent workers share a chunk index
    // counter and each pick up the next unstarted chunk until the file is exhausted.
    // Idempotent server responses ensure correct behaviour on resume.
    useEffect(() => {
      if (!file || pause || !chunkID || bytesUploaded === null) return;
      if (isRunningRef.current) return;

      isRunningRef.current = true;

      // Controller is created synchronously so the cleanup return below can reference it.
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const { signal } = controller;

      (async () => {
        // Refresh resume state from the server before starting workers.
        // This ensures that parts uploaded before a same-session pause are
        // not re-sent, even though init() was not called again.
        try {
          const resp = await axios.get<UploadStateResponse>(`${basePath}/upload/${chunkID}/`);
          resumeStateRef.current = {
            alreadyUploaded: resp.data.uploaded ?? 0,
            completedParts: resp.data.completedParts ?? [],
          };
          setBytesUploaded(resumeStateRef.current.alreadyUploaded);
        } catch {
          // Server has no record yet (first start) — keep existing resumeStateRef.
        }

        if (signal.aborted) {
          isRunningRef.current = false;
          return;
        }

        // Build the list of chunks still needing upload, skipping parts already
        // confirmed by the server so no bytes are re-sent over the network.
        const { alreadyUploaded, completedParts } = resumeStateRef.current;
        const completedPartSet = new Set(completedParts);

        const chunks: { start: number; end: number }[] = [];
        for (let start = 0; start < file.size; start += chunkSize) {
          const partNumber = Math.floor(start / chunkSize) + 1;
          if (!completedPartSet.has(partNumber)) {
            chunks.push({ start, end: Math.min(start + chunkSize, file.size) });
          }
        }

        // Shared mutable index — safe because JS is single-threaded; `chunkIndex++`
        // executes synchronously before any await, so each worker gets a unique chunk.
        let chunkIndex = 0;
        let newBytesUploaded = alreadyUploaded;

        const uploadChunkWithRetry = async (
          chunk: { start: number; end: number },
          maxRetries = 3,
        ) => {
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            const form = new FormData();
            form.append("filename", file.name);
            form.append("chunk", file.slice(chunk.start, chunk.end));

            try {
              await axios.post(`${basePath}/upload/${chunkID}/`, form, {
                signal,
                // NOTE: Do NOT set Content-Type manually — browser must set the
                // multipart boundary automatically when body is FormData.
                headers: {
                  "Content-Range": `bytes ${chunk.start}-${chunk.end}/${file.size}`,
                },
              });

              return; // success
            } catch (err) {
              const isAbort = axios.isCancel(err);
              if (isAbort || attempt === maxRetries - 1) throw err;
              // Exponential back-off: 500ms, 1000ms, 2000ms, ...
              await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
            }
          }
        };

        const uploadWorker = async () => {
          while (!signal.aborted) {
            const chunk = chunks[chunkIndex++];
            if (!chunk) break;

            await uploadChunkWithRetry(chunk);
            newBytesUploaded += chunk.end - chunk.start;
            setBytesUploaded(newBytesUploaded);
          }
        };

        const workerCount = Math.min(parallelism, chunks.length);

        Promise.all(Array.from({ length: workerCount }, () => uploadWorker()))
          .then(async () => {
            if (signal.aborted) return;
            // All chunks uploaded — finalize the multipart upload on the server.
            const body: FinalizeBody = { filename: file.name, tmdb_id: tmdbId };
            if (seasonNumber != null && episodeNumber != null) {
              body.season_number = seasonNumber;
              body.episode_number = episodeNumber;
            }
            await axios.post(`${basePath}/upload/finalize/${chunkID}/`, body);
            doFinish();
          })
          .catch((err) => {
            const isAbort = axios.isCancel(err);
            if (!isAbort) {
              console.error(err);
              setPause(true);
            }
          })
          .finally(() => {
            isRunningRef.current = false;
          });
      })();

      return () => {
        controller.abort();
      };
    }, [pause, file, chunkID]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children({ bytesUploaded, pause, percentProgress, isInitializing, setPause, cancelUpload })}</>;
}

export default FileUploader;
