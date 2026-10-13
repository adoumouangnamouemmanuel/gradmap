import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";
import { createDocumentVersion } from "@/features/documents/actions";
import { documentVersionSchema } from "@/features/documents/upload-validation";
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403, headers });
  try {
    const client = await createActionClient();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: "Please sign in again." }, { status: 401, headers });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Send a valid JSON body." }, { status: 400, headers }); }
    const input = documentVersionSchema.safeParse(body);
    if (!input.success) return NextResponse.json({ error: "Review the file metadata and limits." }, { status: 400, headers });
    if (!input.data.storage_path.startsWith(user.id + "/" + input.data.document_id + "/") || input.data.storage_path.includes("..")) return NextResponse.json({ error: "File not found." }, { status: 404, headers });
    const { data: document, error } = await client.from("documents").select("id").eq("id", input.data.document_id).eq("user_id", user.id).is("archived_at", null).maybeSingle();
    if (error) return NextResponse.json({ error: "Files are temporarily unavailable." }, { status: 503, headers });
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404, headers });
    const version = await createDocumentVersion(input.data);
    return NextResponse.json({ version }, { status: 201, headers });
  } catch { return NextResponse.json({ error: "This file version couldn’t save. Refresh the document before retrying." }, { status: 503, headers }); }
}
