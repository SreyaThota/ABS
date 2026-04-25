import * as pdfjs from "pdfjs-dist";
// Vite-bundled worker URL (works in dev + build, no CORS)
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export async function extractPdfText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const parts: string[] = [];
  const max = Math.min(pdf.numPages, 50);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const c = await page.getTextContent();
    const pageText = c.items
      .map((it: any) => ("str" in it ? it.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) parts.push(pageText);
  }
  return parts.join("\n\n");
}

export async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer: buf });
  return value;
}

export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (name.endsWith(".pdf") || type === "application/pdf") {
    return await extractPdfText(file);
  }
  if (
    name.endsWith(".docx") ||
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return await extractDocxText(file);
  }
  return await file.text();
}
