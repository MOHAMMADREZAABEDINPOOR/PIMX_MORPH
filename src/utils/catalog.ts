import { ConversionType } from "../types";
export type Category =
  "all" | "images" | "pdf" | "audio" | "video" | "documents";
export interface Tool {
  id: ConversionType;
  category: Category;
  en: string;
  fa: string;
  input: string;
  output: string;
}
export const tools: Tool[] = [
  {
    id: "image-convert",
    category: "images",
    en: "Convert image",
    fa: "تبدیل تصویر",
    input: "Image",
    output: "JPG, PNG, WebP, GIF, BMP",
  },
  {
    id: "heic-to-img",
    category: "images",
    en: "HEIC to image",
    fa: "تبدیل عکس آیفون",
    input: "HEIC, HEIF",
    output: "JPG, PNG",
  },
  {
    id: "image-to-pdf",
    category: "images",
    en: "Images to PDF",
    fa: "عکس‌ها به PDF",
    input: "Images",
    output: "PDF",
  },
  {
    id: "pdf-to-img",
    category: "pdf",
    en: "PDF to images",
    fa: "PDF به عکس",
    input: "PDF",
    output: "JPG, PNG",
  },
  {
    id: "pdf-to-docx",
    category: "pdf",
    en: "PDF to Word",
    fa: "PDF به Word",
    input: "PDF",
    output: "DOCX",
  },
  {
    id: "merge-pdf",
    category: "pdf",
    en: "Merge PDFs",
    fa: "ادغام PDFها",
    input: "PDFs",
    output: "PDF",
  },
  {
    id: "split-pdf",
    category: "pdf",
    en: "Split PDF",
    fa: "جدا کردن صفحه‌ها",
    input: "PDF",
    output: "PDF",
  },
  {
    id: "compress-pdf",
    category: "pdf",
    en: "Optimize PDF",
    fa: "بهینه‌سازی PDF",
    input: "PDF",
    output: "PDF",
  },
  {
    id: "pdf-to-txt",
    category: "pdf",
    en: "PDF to text",
    fa: "PDF به متن",
    input: "PDF",
    output: "TXT",
  },
  {
    id: "audio-convert",
    category: "audio",
    en: "Convert audio",
    fa: "تبدیل صدا",
    input: "Audio",
    output: "MP3, WAV, FLAC, OGG, M4A, AAC",
  },
  {
    id: "video-convert",
    category: "video",
    en: "Convert video",
    fa: "تبدیل ویدئو",
    input: "Video",
    output: "MP4, WebM, MOV, MKV, GIF",
  },
  {
    id: "txt-to-pdf",
    category: "documents",
    en: "Text to PDF",
    fa: "متن به PDF",
    input: "TXT, MD",
    output: "PDF",
  },
  {
    id: "docx-to-txt",
    category: "documents",
    en: "Word to text",
    fa: "Word به متن",
    input: "DOCX",
    output: "TXT",
  },
  {
    id: "json-csv",
    category: "documents",
    en: "JSON ↔ CSV",
    fa: "JSON و CSV",
    input: "JSON, CSV",
    output: "CSV, JSON",
  },
];
export const imageExtensions = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "avif",
  "gif",
  "bmp",
  "svg",
  "tiff",
  "tif",
  "heic",
  "heif",
];
export const audioExtensions = [
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "aac",
  "flac",
  "wma",
  "aiff",
  "aif",
  "opus",
];
export const videoExtensions = [
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "flv",
  "3gp",
  "m4v",
  "mpeg",
  "mpg",
];
export const extension = (name: string) =>
  name.split(".").pop()?.toLowerCase() || "";
export function accepts(tool: ConversionType): string[] {
  if (tool === "universal")
    return [
      ...imageExtensions,
      ...audioExtensions,
      ...videoExtensions,
      "pdf",
      "docx",
      "txt",
      "md",
      "csv",
      "json",
    ];
  if (tool === "heic-to-img") return ["heic", "heif"];
  if (tool === "image-convert" || tool === "image-to-pdf")
    return imageExtensions;
  if (tool.includes("pdf") && tool !== "txt-to-pdf") return ["pdf"];
  if (tool === "audio-convert") return audioExtensions;
  if (tool === "video-convert") return videoExtensions;
  if (tool === "txt-to-pdf") return ["txt", "md"];
  if (tool === "docx-to-txt") return ["docx"];
  return ["json", "csv"];
}
export function detect(name: string): ConversionType {
  const ext = extension(name);
  if (ext === "pdf") return "pdf-to-img";
  if (ext === "heic" || ext === "heif") return "heic-to-img";
  if (audioExtensions.includes(ext)) return "audio-convert";
  if (videoExtensions.includes(ext)) return "video-convert";
  if (ext === "docx") return "docx-to-txt";
  if (ext === "json" || ext === "csv") return "json-csv";
  if (ext === "txt" || ext === "md") return "txt-to-pdf";
  return "image-convert";
}
