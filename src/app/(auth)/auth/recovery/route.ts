import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url),
    );
  }

  // Redirect to reset password page with the recovery session
  return NextResponse.redirect(new URL("/reset-password", request.url));
}
