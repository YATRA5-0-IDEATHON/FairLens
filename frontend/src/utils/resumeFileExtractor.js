import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const normalizeText = (value) => value
  .replace(/\r/g, '')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/[ \t]{3,}/g, '  ')
  .trim();

function reconstructPdfText(items) {
  const rows = [];
  items.filter((item) => item.str?.trim()).forEach((item) => {
    const x = item.transform?.[4] || 0;
    const y = item.transform?.[5] || 0;
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push({ x, width: item.width || 0, text: item.str.trim() });
  });

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => {
      const sorted = row.items.sort((a, b) => a.x - b.x);
      return sorted.reduce((line, item, index) => {
        if (!index) return item.text;
        const previous = sorted[index - 1];
        const gap = item.x - (previous.x + previous.width);
        return `${line}${gap > 35 ? '  ' : ' '}${item.text}`;
      }, '');
    })
    .join('\n');
}

async function extractPdf(file, onProgress) {
  const pdf = await getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  let ocrWorker;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress?.(`Reading PDF page ${pageNumber} of ${pdf.numPages}…`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let pageText = reconstructPdfText(content.items).trim();

    // Scanned PDFs have little or no embedded text. Render only those pages
    // and OCR them, while keeping normal text PDFs fast and accurate.
    if (pageText.replace(/\s/g, '').length < 80) {
      if (!ocrWorker) {
        onProgress?.('Scanned PDF detected. Starting OCR…');
        ocrWorker = await createWorker('eng');
      }
      const viewport = page.getViewport({ scale: 2.2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: context, viewport }).promise;
      onProgress?.(`OCR scanning page ${pageNumber} of ${pdf.numPages}…`);
      const result = await ocrWorker.recognize(canvas);
      pageText = result.data.text.trim();
      canvas.width = 0;
      canvas.height = 0;
    }
    pages.push(pageText);
  }
  if (ocrWorker) await ocrWorker.terminate();
  return pages.join('\n\n');
}

export async function extractResumeFile(file, onProgress) {
  if (!file) throw new Error('Choose a resume file first.');
  const name = file.name.toLowerCase();
  if (file.type !== 'application/pdf' && !name.endsWith('.pdf')) {
    throw new Error('Only PDF resume documents are supported.');
  }

  const text = await extractPdf(file, onProgress);
  const normalized = normalizeText(text);
  if (normalized.length < 30) {
    throw new Error('Very little readable text was found. Try a clearer PDF scan.');
  }
  return normalized;
}

export function extractContactDetails(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const email = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || '';
  const phone = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{3,4}/)?.[0] || '';
  const firstLine = lines.find((line) => (
    line.length >= 3
    && line.length <= 60
    && !/@|https?:|resume|curriculum|phone|address/i.test(line)
    && /^[A-Za-zÀ-ÿ.' -]+$/.test(line)
  ));
  return { name: firstLine || '', email, phone };
}
