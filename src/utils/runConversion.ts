import { ConversionType } from "../types";
import { extension } from "./catalog";
type Result = { blob: Blob; name: string };
export async function runConversion(
  tool: ConversionType,
  files: File[],
  options: { format: string; quality: number; pages: string },
  onProgress: (value: number) => void,
): Promise<Result[]> {
  const c = await import("./converter");
  const { format, quality, pages } = options;
  const mime = format === "jpg" ? "image/jpeg" : `image/${format}`;
  const stem = (file: File) => file.name.replace(/\.[^.]+$/, "");
  if (tool === "merge-pdf")
    return [
      { blob: await c.mergePDFs(files, onProgress), name: "morph-merged.pdf" },
    ];
  if (tool === "image-to-pdf")
    return [
      {
        blob: await c.convertImagesToPDF(files, onProgress),
        name: `${stem(files[0])}.pdf`,
      },
    ];
  const results: Result[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i],
      base = stem(file),
      progress = (p: number) => onProgress((i * 100 + p) / files.length);
    let blob: Blob,
      ext = format;
    switch (tool) {
      case "image-convert":
        blob = await c.convertImage(file, mime, quality, progress);
        break;
      case "heic-to-img":
        blob = await c.convertHEIC(file, mime, quality, progress);
        break;
      case "pdf-to-img": {
        const pages = await c.convertPdfToImages(file, mime, progress);
        results.push(
          ...pages.map((page) => ({
            blob: page.blob,
            name: `${base}-page-${page.pageIndex}.${format}`,
          })),
        );
        continue;
      }
      case "pdf-to-docx":
        blob = await c.convertPdfToWord(file, progress);
        ext = "docx";
        break;
      case "split-pdf": {
        blob = await c.splitPDF(file, pages, progress);
        ext = "pdf";
        break;
      }
      case "compress-pdf":
        blob = await c.compressPDF(file, progress);
        ext = "pdf";
        break;
      case "pdf-to-txt":
        blob = await c.convertPdfToTxt(file, progress);
        ext = "txt";
        break;
      case "txt-to-pdf":
        blob = await c.convertTxtToPdf(file, progress);
        ext = "pdf";
        break;
      case "docx-to-txt":
        blob = await c.convertDocxToTxt(file, progress);
        ext = "txt";
        break;
      case "json-csv":
        blob =
          extension(file.name) === "json"
            ? await c.convertJsonToCsv(file)
            : await c.convertCsvToJson(file);
        ext = extension(file.name) === "json" ? "csv" : "json";
        progress(100);
        break;
      case "audio-convert":
      case "video-convert":
        blob = await c.convertAudioVideo(file, format, progress);
        break;
      default:
        throw new Error("Choose a conversion tool first.");
    }
    results.push({ blob, name: `${base}.${ext}` });
  }
  onProgress(100);
  return results;
}
