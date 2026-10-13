import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  try {
    const client = await createActionClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Please sign in again." }, { status: 401, headers });
    const path = request.nextUrl.searchParams.get("path");
    if (!path || path.length > 500 || path.includes("..") || !path.startsWith(`${user.id}/`))
      return NextResponse.json({ error: "This file is unavailable." }, { status: 404, headers });
    const { data: version, error: readError } = await client
      .from("document_versions")
      .select("file_name")
      .eq("storage_path", path)
      .eq("user_id", user.id)
      .maybeSingle();
    if (readError || !version)
      return NextResponse.json({ error: "This file is unavailable." }, { status: 404, headers });
    const name = version.file_name.replace(/[\\/\x00-\x1f\x7f]/g, "_").slice(0, 200);
    const download = request.nextUrl.searchParams.get("download") === "1";
    const { data, error } = await client.storage
      .from("application-files")
      .createSignedUrl(path, 60, download ? { download: name } : undefined);
    if (error || !data)
      return NextResponse.json(
        { error: "The download couldn’t start. Please try again." },
        { status: 503, headers },
      );
    return NextResponse.redirect(data.signedUrl, { headers });
  } catch {
    return NextResponse.json(
      { error: "The download couldn’t start. Please try again." },
      { status: 503, headers },
    );
  }
}
