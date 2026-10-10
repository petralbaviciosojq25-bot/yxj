import { useEffect, useRef, useState } from "react";
import manifest from "./videoChunks.json";

// This immutable revision contains byte-for-byte chunks of the original MP4s.
const cdnRoot = "https://cdn.jsdelivr.net/gh/petralbaviciosojq25-bot/yxj@640e411be1b410f064fd7c2086d32fdfbed0180e/public/assets/";
const mirrorRoot = "https://fastly.jsdelivr.net/gh/petralbaviciosojq25-bot/yxj@640e411be1b410f064fd7c2086d32fdfbed0180e/public/assets/";

async function verifiedChunk(url, chunk, signal) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) cancel();
  const timer = setTimeout(cancel, 15000);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "force-cache" });
    if (!response.ok) throw new Error(`Video chunk response ${response.status}`);
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== chunk.size) throw new Error("Incomplete video chunk");
    const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((byte) => byte.toString(16).padStart(2, "0")).join("");
    if (hash !== chunk.sha256) throw new Error("Video chunk checksum mismatch");
    return bytes;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", cancel);
  }
}

export function useBufferedVideo(source, enabled) {
  const [attempt, setAttempt] = useState(0);
  const [video, setVideo] = useState({ url: null, progress: 0, error: false });
  const chunksCache = useRef(new Map());
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let objectUrl;
    const filename = source.split("/").at(-1);
    const entry = manifest[filename];
    const localRoot = source.slice(0, source.lastIndexOf("/") + 1);
    setVideo({ url: null, progress: 0, error: false });
    const download = async () => {
      try {
        const chunks = new Array(entry.chunks.length);
        let cursor = 0;
        let loaded = 0;
        const worker = async () => {
          while (!controller.signal.aborted && cursor < entry.chunks.length) {
            const index = cursor++;
            const chunk = entry.chunks[index];
            let bytes = chunksCache.current.get(chunk.path);
            if (!bytes) {
              for (const root of [cdnRoot, localRoot, mirrorRoot]) {
                try { bytes = await verifiedChunk(root + chunk.path, chunk, controller.signal); break; }
                catch (error) { if (controller.signal.aborted) throw error; }
              }
              if (!bytes) throw new Error("Video download unavailable");
              chunksCache.current.set(chunk.path, bytes);
            }
            chunks[index] = bytes;
            loaded += bytes.byteLength;
            if (!controller.signal.aborted) setVideo({ url: null, progress: Math.floor(loaded / entry.size * 100), error: false });
          }
        };
        await Promise.all(Array.from({ length: 3 }, worker));
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: "video/mp4" }));
        setVideo({ url: objectUrl, progress: 100, error: false });
      } catch {
        if (!controller.signal.aborted) {
          setVideo((previous) => ({ ...previous, error: true }));
          controller.abort();
        }
      }
    };
    download();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source, enabled, attempt]);
  return { ...video, retry: () => setAttempt((value) => value + 1) };
}
