import { z } from "zod";

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const documentVersionSchema = z.object({
  document_id: z.string().uuid(), file_name: z.string().min(1).max(200),
  mime_type: z.enum(DOCUMENT_MIME_TYPES), file_size: z.number().int().min(1).max(MAX_DOCUMENT_BYTES),
  storage_path: z.string().min(1).max(500), sha256_hash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  notes: z.string().max(10000).optional(),
});
export function validateDocumentBytes(
  bytes: Uint8Array,
  mime: string,
  name: string,
  declaredSize: number,
) {
  if (!bytes.length || bytes.length > MAX_DOCUMENT_BYTES || bytes.length !== declaredSize)
    throw new Error("The file is empty, oversized, or its size does not match.");
  const header = Buffer.from(bytes.subarray(0, 8));
  const file = Buffer.from(bytes);
  const ext = name.split(".").pop()?.toLowerCase();
  const accepted =
    (mime === "application/pdf" && ext === "pdf" && header.subarray(0, 5).toString() === "%PDF-") ||
    (mime === "image/png" &&
      ext === "png" &&
      header.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ||
    (mime === "image/jpeg" &&
      ["jpg", "jpeg"].includes(ext || "") &&
      header[0] === 255 &&
      header[1] === 216 &&
      header[2] === 255) ||
    (mime === DOCUMENT_MIME_TYPES[3] &&
      ext === "docx" &&
      header[0] === 80 &&
      header[1] === 75 &&
      header[2] === 3 &&
      header[3] === 4 &&
      file.includes(Buffer.from("[Content_Types].xml")) &&
      file.includes(Buffer.from("word/document.xml")) &&
      !file.includes(Buffer.from("vbaProject.bin")));
  if (!accepted)
    throw new Error("Use a PDF, PNG, JPEG or standard DOCX file whose contents match its type.");
}
