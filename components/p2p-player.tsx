// components/P2PPlayer.jsx
"use client"; // remove this line if you're on Next.js pages router

import { useState, useRef } from "react";

/**
 * movieId — the IMDB ID stored in flix.tmdb_id, e.g. "tt26443616"
 */
export default function P2PPlayer({ movieId }: { movieId: string }) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadStream = async () => {
    console.log("Requesting stream for movieId:", movieId);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/node/stream/${movieId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }


      const { streamUrl } = await res.json();

      console.log("Received stream URL:", streamUrl);

      setStreamUrl(streamUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Once streamUrl is set, tell the video element to load it
  const handleVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamUrl) el.load();
  };

  if (!streamUrl) {
    return (
      <div>
        <button onClick={loadStream} disabled={loading}>
          {loading ? "loading…" : "Stream"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  return (
    <video ref={handleVideoRef} controls style={{ width: "100%", height: "100%" }}>
      <source src={streamUrl} />
    </video>
  );
}
