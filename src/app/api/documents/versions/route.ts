import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { document_id, file_name, mime_type, file_size, storage_path, sha256_hash } = body;

    if (!document_id || !file_name || !mime_type || !file_size || !storage_path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify document belongs to user
    const { data: doc } = await supabase
      .from("documents")
      .select("id")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get next version number
    const { data: existing } = await supabase
      .from("document_versions")
      .select("version_number")
      .eq("document_id", document_id)
      .order("version_number", { ascending: false })
      .limit(1);

    const nextVersion = (existing?.[0]?.version_number || 0) + 1;

    // Insert version
    const { data: version, error } = await supabase
      .from("document_versions")
      .insert({
        user_id: user.id,
        document_id,
        version_number: nextVersion,
        file_name,
        mime_type,
        file_size,
        storage_path,
        sha256_hash: sha256_hash || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update current_version_id on parent document
    await supabase
      .from("documents")
      .update({ current_version_id: version.id })
      .eq("id", document_id);

    return NextResponse.json({ version });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
