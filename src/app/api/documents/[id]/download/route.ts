import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canSeeVisibility } from "@/lib/permissions";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Internal documents are only downloadable by admins.
  if (!canSeeVisibility(user.role, doc.visibility)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let bytes: Buffer;
  try {
    bytes = await readStoredFile(doc.filename);
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Length": String(doc.size),
      "Content-Disposition": `inline; filename="${encodeURIComponent(
        doc.originalName,
      )}"`,
    },
  });
}
