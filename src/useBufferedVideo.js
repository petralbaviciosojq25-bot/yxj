import { useEffect, useState } from "react";

// Download one exact copy before playback so network stalls cannot interrupt it.
export function useBufferedVideo(source, enabled) {
  const [video, setVideo] = useState({ url: null, progress: 0 });
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let objectUrl;
    let disposed = false;
    setVideo({ url: null, progress: 0 });
    const download = async () => {
      try {
        const response = await fetch(source, { cache: "force-cache", priority: "low", signal: controller.signal });
        if (!response.ok) throw new Error(`Video response ${response.status}`);
        const total = Number(response.headers.get("content-length"));
        let blob;
        if (response.body && total > 0) {
          const reader = response.body.getReader();
          const chunks = [];
          let loaded = 0;
          let lastProgress = 0;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.byteLength;
            const progress = Math.min(99, Math.floor(loaded / total * 100));
            if (!disposed && progress >= lastProgress + 5) {
              lastProgress = progress;
              setVideo({ url: null, progress });
            }
          }
          blob = new Blob(chunks, { type: "video/mp4" });
        } else blob = await response.blob();
        if (disposed) return;
        objectUrl = URL.createObjectURL(blob);
        setVideo({ url: objectUrl, progress: 100 });
      } catch {
        // Keep the poster visible if the request fails; retain native retry support.
        if (!disposed) setVideo({ url: source, progress: null });
      }
    };
    download();
    return () => {
      disposed = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source, enabled]);
  return video;
}
