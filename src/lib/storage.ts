import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

function uploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

export type StoredFile = {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
};

/** Persist an uploaded File to disk and return its metadata. */
export async function saveUploadedFile(file: File): Promise<StoredFile> {
  const dir = uploadDir();
  await fs.mkdir(dir, { recursive: true });

  const ext = path.extname(file.name).slice(0, 20).replace(/[^a-zA-Z0-9.]/g, "");
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  return {
    filename,
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

/** Read a stored file's bytes. Throws if the filename is unsafe or missing. */
export async function readStoredFile(filename: string): Promise<Buffer> {
  // Guard against path traversal — only a bare filename is allowed.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid filename");
  }
  return fs.readFile(path.join(uploadDir(), filename));
}

/** Best-effort delete of a stored file. */
export async function deleteStoredFile(filename: string): Promise<void> {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return;
  }
  try {
    await fs.unlink(path.join(uploadDir(), filename));
  } catch {
    // ignore missing file
  }
}
