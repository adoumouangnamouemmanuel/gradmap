import { NextRequest, NextResponse } from "next/server";
import { createActionClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createActionClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const name = searchParams.get("name");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    // Verify the path belongs to the user
    if (!path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create signed URL (expires in 60 seconds)
    const { data, error } = await supabase.storage
      .from("application-files")
      .createSignedUrl(path, 60);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect to the signed URL for download
    return NextResponse.redirect(data.signedUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
