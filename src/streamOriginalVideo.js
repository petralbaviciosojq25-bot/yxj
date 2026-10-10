import streams from "./videoStreams.json";

const cdnRoot = "https://cdn.jsdelivr.net/gh/petralbaviciosojq25-bot/yxj@5fa98ee6adb00ea82ec75d888df531581e0d92d5/public/assets/";

// A fallback for slow MP4 routes. The segments contain the original encoded
// frames, remuxed without encoding, and become playable before the final segment.
export function streamOriginalVideo(video, filename, onError) {
  const entry = streams[filename];
  const type = `video/mp4; codecs="${entry.codec}"`;
  if (!window.MediaSource || !MediaSource.isTypeSupported(type)) {
    onError();
    return () => {};
  }
  const controller = new AbortController();
  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  video.src = url;
  let buffer;
  const localRoot = `${import.meta.env.BASE_URL}assets/`;
  let preferredRoot = cdnRoot;
  const download = async (path) => {
    if (controller.signal.aborted) throw new Error("Stream cancelled");
    const roots = preferredRoot === cdnRoot ? [cdnRoot, localRoot] : [localRoot, cdnRoot];
    for (const root of roots) {
      const request = new AbortController();
      const cancel = () => request.abort();
      controller.signal.addEventListener("abort", cancel, { once: true });
      const timeout = window.setTimeout(cancel, 10000);
      try {
        const response = await fetch(root + path, { signal: request.signal, cache: "force-cache" });
        if (!response.ok) throw new Error(`Stream response ${response.status}`);
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength < 8) throw new Error("Empty video segment");
        preferredRoot = root;
        return bytes;
      } catch (error) {
        if (controller.signal.aborted) throw error;
      } finally {
        window.clearTimeout(timeout);
        controller.signal.removeEventListener("abort", cancel);
      }
    }
    throw new Error("Stream download failed");
  };
  const append = (bytes) => new Promise((resolve, reject) => {
    const cleanup = () => {
      buffer.removeEventListener("updateend", done);
      buffer.removeEventListener("error", failed);
      controller.signal.removeEventListener("abort", failed);
    };
    const done = () => { cleanup(); resolve(); };
    const failed = () => { cleanup(); reject(new Error("Stream append interrupted")); };
    buffer.addEventListener("updateend", done, { once: true });
    buffer.addEventListener("error", failed, { once: true });
    controller.signal.addEventListener("abort", failed, { once: true });
    try { buffer.appendBuffer(bytes); } catch (error) { cleanup(); reject(error); }
  });
  const start = async () => {
    try {
      buffer = mediaSource.addSourceBuffer(type);
      // MP4 B-frame timestamp shifts must not leave a gap at the loop start.
      buffer.timestampOffset = -entry.startTime;
      for (const path of [entry.init, ...entry.segments]) {
        const bytes = await download(path);
        if (controller.signal.aborted) return;
        await append(bytes);
      }
      if (!controller.signal.aborted && mediaSource.readyState === "open") mediaSource.endOfStream();
    } catch {
      if (!controller.signal.aborted) onError();
    }
  };
  mediaSource.addEventListener("sourceopen", start, { once: true });
  return () => {
    controller.abort();
    mediaSource.removeEventListener("sourceopen", start);
    if (mediaSource.readyState === "open" && buffer?.updating) {
      try { buffer.abort(); } catch { /* The media element may already have detached. */ }
    }
    URL.revokeObjectURL(url);
  };
}
