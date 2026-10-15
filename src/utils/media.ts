import { FFmpeg } from "@ffmpeg/ffmpeg";
import { MEDIA_CACHE, MEDIA_URLS } from "./mediaAssets";
let engine: FFmpeg | undefined;
let loading: Promise<FFmpeg> | undefined;
let locked = false;
export async function loadMediaEngine() {
  if (loading) return loading;
  engine = new FFmpeg();
  loading = (async () => {
    const urls: string[] = [],
      resources: Blob[] = [];
    try {
      // Fetch in the controlled page: module imports inside a new Worker may bypass
      // its parent's service worker on a cold offline launch.
      for (const path of MEDIA_URLS) {
        const cached =
          "caches" in window ? await caches.match(path) : undefined;
        const response = cached || (await fetch(path));
        if (!response.ok)
          throw new Error("The media engine download did not finish.");
        if (!cached && "caches" in window) {
          const cache = await caches.open(MEDIA_CACHE);
          await cache.put(path, response.clone());
        }
        resources.push(await response.blob());
      }
      urls.push(
        URL.createObjectURL(
          new Blob([resources[0]], { type: "text/javascript" }),
        ),
        URL.createObjectURL(
          new Blob(resources.slice(1), { type: "application/wasm" }),
        ),
      );
      await engine!.load({ coreURL: urls[0], wasmURL: urls[1] });
      return engine!;
    } finally {
      urls.forEach(URL.revokeObjectURL);
    }
  })().catch((error) => {
    loading = undefined;
    engine?.terminate();
    engine = undefined;
    console.error("Media engine load failed:", error);
    throw new Error(
      navigator.onLine
        ? "The media engine could not start. Refresh and try again."
        : "The media engine could not start offline. Reconnect and save the media tools again.",
      { cause: error },
    );
  });
  return loading;
}
export async function transcode(
  file: File,
  target: string,
  onProgress: (progress: number) => void,
  singleFrame = false,
): Promise<Blob> {
  if (locked)
    throw new Error(
      "Another media conversion is running. Let it finish first.",
    );
  locked = true;
  let ffmpeg: FFmpeg | undefined;
  const input = `input.${
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "bin"
    }`,
    output = `output.${target}`;
  const progress = ({ progress: value }: { progress: number }) =>
    onProgress(Math.min(95, Math.max(15, value * 80 + 15)));
  const mime: Record<string, string> = {
    jpg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
  };
  try {
    onProgress(3);
    ffmpeg = await loadMediaEngine();
    onProgress(15);
    ffmpeg.on("progress", progress);
    await ffmpeg.writeFile(input, new Uint8Array(await file.arrayBuffer()));
    const audio = ["mp3", "wav", "flac", "ogg", "m4a", "aac"].includes(target);
    const args = ["-i", input];
    if (singleFrame) args.push("-frames:v", "1");
    if (audio) args.push("-vn");
    if (target === "mp3") args.push("-c:a", "libmp3lame", "-q:a", "2");
    if (target === "ogg") args.push("-c:a", "libvorbis");
    if (target === "m4a" || target === "aac")
      args.push("-c:a", "aac", "-b:a", "192k");
    if (["mp4", "mov", "mkv"].includes(target))
      args.push(
        "-vf",
        "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
      );
    if (target === "mp4" || target === "mov")
      args.push("-movflags", "+faststart");
    if (target === "webm")
      args.push(
        "-c:v",
        "libvpx",
        "-deadline",
        "realtime",
        "-cpu-used",
        "5",
        "-c:a",
        "libopus",
      );
    if (target === "gif" && !singleFrame)
      args.push("-vf", "fps=12,scale=min(720\\,iw):-1:flags=lanczos");
    args.push("-y", output);
    const code = await ffmpeg.exec(args);
    if (code !== 0)
      throw new Error(
        "This file’s codec could not be converted to that format. Try another output or a smaller file.",
      );
    const data = await ffmpeg.readFile(output);
    if (typeof data === "string" || data.length === 0)
      throw new Error("The conversion returned an empty file.");
    onProgress(100);
    return new Blob([new Uint8Array(data)], {
      type: mime[target] || "application/octet-stream",
    });
  } finally {
    if (ffmpeg) {
      ffmpeg.off("progress", progress);
      await Promise.allSettled([
        ffmpeg.deleteFile(input),
        ffmpeg.deleteFile(output),
      ]);
    }
    locked = false;
  }
}
