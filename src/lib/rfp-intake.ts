// Client-side text extraction for RFP intake uploads.
// Supports PDF (pdfjs-dist), DOCX (mammoth), and plain text.
// Returns text only — files themselves are never uploaded to the server.

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_PER_FILE_CHARS = 40_000;

export type SourceKind = 'COMPANY' | 'INBOUND_RFP' | 'NOTES';

export interface ExtractedSource {
  name: string;
  kind: SourceKind;
  text: string;
  size: number; // chars
}

export async function extractFile(file: File, kind: SourceKind): Promise<ExtractedSource> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  let text = '';
  if (ext === 'pdf' || file.type === 'application/pdf') {
    text = await extractPdf(file);
  } else if (ext === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    text = await extractDocx(file);
  } else if (ext === 'txt' || ext === 'md' || file.type.startsWith('text/')) {
    text = await file.text();
  } else {
    throw new Error(`Unsupported file type: ${file.name}. Use PDF, DOCX, TXT, or MD.`);
  }
  text = normalize(text).slice(0, MAX_PER_FILE_CHARS);
  if (!text.trim()) throw new Error(`No readable text in ${file.name}`);
  return { name: file.name, kind, text, size: text.length };
}

async function extractPdf(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await (pdfjsLib as any).getDocument({ data: buf }).promise;
  const parts: string[] = [];
  const pageLimit = Math.min(pdf.numPages, 80);
  for (let i = 1; i <= pageLimit; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const txt = (content.items as any[]).map((it) => it.str).join(' ');
    parts.push(txt);
    if (parts.join('\n').length > MAX_PER_FILE_CHARS) break;
  }
  return parts.join('\n\n');
}

async function extractDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

function normalize(s: string) {
  return s.replace(/\u0000/g, '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
