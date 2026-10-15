import {
  accepts,
  audioExtensions,
  detect,
  extension,
  imageExtensions,
  videoExtensions,
  Category,
} from "./catalog";
import { ConversionType } from "../types";
export interface OutputChoice {
  id: string;
  label: string;
  tool: ConversionType;
  format: string;
  kind: "image" | "document" | "audio" | "video" | "data";
  operation?: boolean;
}
export function fileFamily(name: string): string {
  const ext = extension(name);
  if (imageExtensions.includes(ext)) return "images";
  if (audioExtensions.includes(ext)) return "audio";
  if (videoExtensions.includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["txt", "md"].includes(ext)) return "text";
  if (ext === "docx") return "word";
  if (ext === "json" || ext === "csv") return ext;
  return "unsupported";
}
export function fileCategory(name: string): Category {
  const family = fileFamily(name);
  return ["images", "audio", "video", "pdf"].includes(family)
    ? (family as Category)
    : "documents";
}
export function outputChoices(files: File[]): OutputChoice[] {
  if (!files.length) return [];
  const family = fileFamily(files[0].name),
    choice = (
      label: string,
      tool: ConversionType,
      kind: OutputChoice["kind"],
    ): OutputChoice => ({
      id: `${tool}:${label.toLowerCase()}`,
      label,
      tool,
      format: label.toLowerCase(),
      kind,
    });
  if (family === "images") {
    const heic = files.some((file) =>
      ["heic", "heif"].includes(extension(file.name)),
    );
    return [
      ...(heic
        ? ["WEBP", "JPG", "PNG"]
        : ["WEBP", "JPG", "PNG", "GIF", "BMP"]
      ).map((format) => choice(format, "image-convert", "image")),
      choice("PDF", "image-to-pdf", "document"),
    ];
  }
  if (family === "pdf")
    return [
      choice("JPG", "pdf-to-img", "image"),
      choice("PNG", "pdf-to-img", "image"),
      choice("DOCX", "pdf-to-docx", "document"),
      choice("TXT", "pdf-to-txt", "document"),
      ...(files.length > 1
        ? [
            {
              ...choice("PDF", "merge-pdf", "document"),
              id: "merge-pdf",
              operation: true,
            },
          ]
        : []),
      {
        ...choice("PDF", "split-pdf", "document"),
        id: "split-pdf",
        operation: true,
      },
      {
        ...choice("PDF", "compress-pdf", "document"),
        id: "compress-pdf",
        operation: true,
      },
    ];
  if (family === "audio")
    return ["MP3", "WAV", "FLAC", "OGG", "M4A", "AAC"].map((format) =>
      choice(format, "audio-convert", "audio"),
    );
  if (family === "video")
    return ["MP4", "WEBM", "MOV", "MKV", "GIF"].map((format) =>
      choice(format, "video-convert", format === "GIF" ? "image" : "video"),
    );
  if (family === "text") return [choice("PDF", "txt-to-pdf", "document")];
  if (family === "word") return [choice("TXT", "docx-to-txt", "document")];
  if (family === "json") return [choice("CSV", "json-csv", "data")];
  if (family === "csv") return [choice("JSON", "json-csv", "data")];
  return [];
}
export function isSupportedFile(name: string) {
  return accepts("universal").includes(extension(name));
}
