export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_PAGE_COUNT = 10;

export function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export function validatePdfFile(file: File) {
  if (!isPdfFile(file)) {
    throw new Error("This version only accepts PDF files.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("This version supports PDF files up to 10MB.");
  }
}

export async function detectPdfPageCount(file: File) {
  validatePdfFile(file);

  const buffer = await file.arrayBuffer();
  const decoded = new TextDecoder("latin1").decode(buffer);
  const pageMatches = decoded.match(/\/Type\s*\/Page\b/g) ?? [];
  const pageCount = pageMatches.length;

  if (!pageCount) {
    throw new Error("We could not read this PDF. Please try another file.");
  }

  if (pageCount > MAX_PAGE_COUNT) {
    throw new Error("This version supports up to 10 pages.");
  }

  return pageCount;
}

