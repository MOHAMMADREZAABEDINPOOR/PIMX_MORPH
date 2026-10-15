import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type Progress = (value: number) => void;
let pdfEngine: Promise<any> | undefined;
export function loadPdfJS(): Promise<any> {
  if (!pdfEngine)
    pdfEngine = Promise.all([
      import("pdfjs-dist"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ])
      .then(([pdfjs, worker]) => {
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        return pdfjs;
      })
      .catch((error) => {
        pdfEngine = undefined;
        throw error;
      });
  return pdfEngine;
}
async function openPdf(file: File) {
  const pdfjs = await loadPdfJS();
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: "/pdf/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/pdf/standard_fonts/",
    wasmUrl: "/pdf/wasm/",
  });
  try {
    return { pdf: await task.promise, close: () => task.destroy() };
  } catch (error) {
    await task.destroy();
    throw error;
  }
}
const pdfBlob = (bytes: Uint8Array) =>
  new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
export async function convertImage(
  file: File,
  format: string,
  quality: number,
  onProgress: Progress,
): Promise<Blob> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const target = format === "image/jpeg" ? "jpg" : format.split("/")[1];
  if (
    ["image/gif", "image/bmp"].includes(format) ||
    ["tiff", "tif"].includes(ext || "")
  ) {
    const { transcode } = await import("./media");
    return transcode(file, target, onProgress, true);
  }
  if (["heic", "heif"].includes(ext || ""))
    return convertHEIC(file, format, quality, onProgress);
  onProgress(10);
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(
          new Error(
            "This image could not be opened. Try a different image format or check that the file is intact.",
          ),
        );
      img.src = url;
    });
    onProgress(45);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    if (canvas.width * canvas.height > 80_000_000)
      throw new Error(
        "This image is too large to process safely. Try an image with fewer pixels.",
      );
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Your browser could not open the image editor.");
    if (format === "image/jpeg") {
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0);
    onProgress(80);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(
                new Error(
                  "The image could not be saved. Try another output format.",
                ),
              ),
        format,
        quality,
      ),
    );
    canvas.width = 0;
    canvas.height = 0;
    if (blob.type !== format)
      throw new Error(
        "Your browser cannot export this format. Choose JPG, PNG or WebP.",
      );
    onProgress(100);
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function convertHEIC(
  file: File,
  format: string,
  quality: number,
  onProgress: Progress,
): Promise<Blob> {
  onProgress(10);
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({
    blob: file,
    toType: format === "image/webp" ? "image/png" : format,
    quality,
  });
  const blob = Array.isArray(result) ? result[0] : result;
  onProgress(85);
  if (format === "image/webp")
    return convertImage(
      new File([blob], "decoded.png", { type: "image/png" }),
      format,
      quality,
      onProgress,
    );
  onProgress(100);
  return blob;
}
export async function mergePDFs(
  files: File[],
  onProgress: Progress,
): Promise<Blob> {
  const result = await PDFDocument.create();
  for (let index = 0; index < files.length; index++) {
    const pdf = await PDFDocument.load(await files[index].arrayBuffer());
    const pages = await result.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => result.addPage(page));
    onProgress(((index + 1) / files.length) * 90);
  }
  const blob = pdfBlob(await result.save());
  onProgress(100);
  return blob;
}
export async function splitPDF(
  file: File,
  ranges: string,
  onProgress: Progress,
): Promise<Blob> {
  onProgress(10);
  const original = await PDFDocument.load(await file.arrayBuffer()),
    count = original.getPageCount(),
    indices: number[] = [];
  const normal = ranges
    .replace(/[۰-۹]/g, (ch) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(ch)))
    .replace(/[٠-٩]/g, (ch) => String("٠١٢٣٤٥٦٧٨٩".indexOf(ch)))
    .replace(/،/g, ",");
  for (const range of normal.split(",")) {
    const match = range.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match)
      throw new Error(
        `Use page numbers or ranges, such as 1-3, 5. This PDF has ${count} pages.`,
      );
    const start = Number(match[1]),
      end = Number(match[2] || match[1]);
    if (start < 1 || end > count || start > end)
      throw new Error(
        `Choose pages between 1 and ${count}, with the first page before the last.`,
      );
    for (let page = start; page <= end; page++) indices.push(page - 1);
  }
  onProgress(50);
  const result = await PDFDocument.create();
  const copied = await result.copyPages(original, indices);
  copied.forEach((page) => result.addPage(page));
  const blob = pdfBlob(await result.save());
  onProgress(100);
  return blob;
}
export async function compressPDF(
  file: File,
  onProgress: Progress,
): Promise<Blob> {
  onProgress(20);
  const pdf = await PDFDocument.load(await file.arrayBuffer());
  onProgress(60);
  const result = pdfBlob(await pdf.save({ useObjectStreams: true }));
  onProgress(100);
  return result.size < file.size
    ? result
    : new Blob([file], { type: "application/pdf" });
}
export async function convertPdfToImages(
  file: File,
  format: string,
  onProgress: Progress,
): Promise<{ blob: Blob; pageIndex: number }[]> {
  onProgress(10);
  const { pdf, close } = await openPdf(file),
    results: { blob: Blob; pageIndex: number }[] = [];
  try {
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index),
        viewport = page.getViewport({ scale: 1.5 });
      if (viewport.width * viewport.height > 40_000_000)
        throw new Error("This PDF page is too large to render on this device.");
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({
        canvas,
        canvasContext: canvas.getContext("2d"),
        viewport,
        background: "#ffffff",
      }).promise;
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (blob) =>
            blob
              ? resolve(blob)
              : reject(new Error("A PDF page could not be saved.")),
          format,
          0.92,
        ),
      );
      results.push({ blob, pageIndex: index });
      canvas.width = 0;
      canvas.height = 0;
      page.cleanup();
      onProgress(10 + (index / pdf.numPages) * 90);
    }
    return results;
  } finally {
    await close();
  }
}
async function extractPdfText(
  file: File,
  onProgress: Progress,
): Promise<string[]> {
  const { pdf, close } = await openPdf(file),
    pages: string[] = [];
  try {
    for (let index = 1; index <= pdf.numPages; index++) {
      const page = await pdf.getPage(index),
        content = await page.getTextContent();
      let text = "",
        lastY: number | undefined;
      for (const item of content.items) {
        if (!("str" in item)) continue;
        const y = item.transform[5];
        if (lastY !== undefined) text += Math.abs(y - lastY) > 5 ? "\n" : " ";
        text += item.str;
        if (item.hasEOL) {
          text += "\n";
          lastY = undefined;
        } else lastY = y;
      }
      pages.push(text.trim());
      onProgress(10 + (index / pdf.numPages) * 75);
    }
    if (!pages.some((page) => page.trim()))
      throw new Error(
        "This PDF has no readable text. Scanned pages need an OCR tool.",
      );
    return pages;
  } finally {
    await close();
  }
}
export async function convertPdfToTxt(
  file: File,
  onProgress: Progress,
): Promise<Blob> {
  onProgress(5);
  const pages = await extractPdfText(file, onProgress);
  onProgress(100);
  return new Blob([pages.join("\n\n")], { type: "text/plain;charset=utf-8" });
}
export async function convertPdfToWord(
  file: File,
  onProgress: Progress,
): Promise<Blob> {
  const pages = await extractPdfText(file, onProgress);
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const document = new Document({
    sections: pages.map((text) => ({
      children: text
        .split("\n")
        .map(
          (line) =>
            new Paragraph({
              bidirectional: /[\u0600-\u06ff]/.test(line),
              children: [
                new TextRun({
                  text: line,
                  size: 24,
                  rightToLeft: /[\u0600-\u06ff]/.test(line),
                }),
              ],
            }),
        ),
    })),
  });
  const result = await Packer.toBlob(document);
  onProgress(100);
  return result;
}
export async function convertImagesToPDF(
  files: File[],
  onProgress: Progress,
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < files.length; index++) {
    const file = files[index],
      png = await convertImage(file, "image/png", 1, () => {}),
      image = await pdf.embedPng(await png.arrayBuffer());
    const page = pdf.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
    onProgress(((index + 1) / files.length) * 90);
  }
  const result = pdfBlob(await pdf.save());
  onProgress(100);
  return result;
}
export async function convertTxtToPdf(
  file: File,
  onProgress: Progress,
): Promise<Blob> {
  const text = await file.text(),
    pdf = await PDFDocument.create();
  onProgress(20);
  let font;
  if (/[^\x00-\x7F]/.test(text)) {
    pdf.registerFontkit(fontkit);
    const response = await fetch("/fonts/Vazirmatn-Regular.ttf");
    if (!response.ok)
      throw new Error(
        "The document font isn’t available. Reconnect and reload the app to save it.",
      );
    font = await pdf.embedFont(await response.arrayBuffer(), { subset: true });
  } else font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 11,
    margin = 45,
    lineHeight = 18;
  let page = pdf.addPage(),
    y = page.getHeight() - margin;
  const draw = (line: string) => {
    if (y < margin) {
      page = pdf.addPage();
      y = page.getHeight() - margin;
    }
    const rtl = /[\u0600-\u06ff]/.test(line);
    page.drawText(line, {
      x: rtl
        ? Math.max(
            margin,
            page.getWidth() - margin - font.widthOfTextAtSize(line, fontSize),
          )
        : margin,
      y,
      font,
      size: fontSize,
    });
    y -= lineHeight;
  };
  const lines = text
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/\t/g, "    ")
    .split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    let current = "";
    const maxWidth = page.getWidth() - margin * 2;
    for (const character of lines[index]) {
      if (
        font.widthOfTextAtSize(current + character, fontSize) > maxWidth &&
        current
      ) {
        draw(current);
        current = character;
      } else current += character;
    }
    draw(current);
    onProgress(25 + ((index + 1) / lines.length) * 65);
  }
  const result = pdfBlob(await pdf.save());
  onProgress(100);
  return result;
}
export async function convertDocxToTxt(
  file: File,
  onProgress: Progress,
): Promise<Blob> {
  onProgress(10);
  const mammoth = await import("mammoth/mammoth.browser");
  const { value } = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  onProgress(100);
  return new Blob([value], { type: "text/plain;charset=utf-8" });
}
export async function convertJsonToCsv(file: File): Promise<Blob> {
  const data = JSON.parse((await file.text()).replace(/^\uFEFF/, ""));
  const records = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null
      ? [data]
      : null;
  if (
    !records ||
    records.some(
      (row) => row === null || typeof row !== "object" || Array.isArray(row),
    )
  )
    throw new Error(
      "Use a JSON object or an array of objects to create a CSV.",
    );
  const headers = [...new Set(records.flatMap((row) => Object.keys(row)))];
  const escape = (value: unknown) =>
    `"${String(typeof value === "object" && value !== null ? JSON.stringify(value) : (value ?? "")).replace(/"/g, '""')}"`;
  const rows = [
    headers.map(escape).join(","),
    ...records.map((row) =>
      headers.map((header) => escape(row[header])).join(","),
    ),
  ];
  return new Blob(["\uFEFF" + rows.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
}
export async function convertCsvToJson(file: File): Promise<Blob> {
  const text = (await file.text()).replace(/^\uFEFF/, ""),
    rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index++;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index++;
      row.push(field);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (quoted)
    throw new Error(
      "A quoted CSV field is missing its closing quote. Check the file and try again.",
    );
  row.push(field);
  if (row.some((value) => value !== "")) rows.push(row);
  if (!rows.length) return new Blob(["[]"], { type: "application/json" });
  const headers = rows.shift()!;
  if (new Set(headers).size !== headers.length)
    throw new Error(
      "The CSV has duplicate column names. Give each column a unique name first.",
    );
  const records = rows.map((values) => {
    if (values.length !== headers.length)
      throw new Error(
        "A CSV row has a different number of columns. Check the commas and quotes.",
      );
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index]]),
    );
  });
  return new Blob([JSON.stringify(records, null, 2)], {
    type: "application/json;charset=utf-8",
  });
}
export async function convertAudioVideo(
  file: File,
  target: string,
  onProgress: Progress,
): Promise<Blob> {
  const { transcode } = await import("./media");
  return transcode(file, target, onProgress);
}
