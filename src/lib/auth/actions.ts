"use server";

import { redirect } from "next/navigation";
import { createActionClient, createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createActionClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=Email+and+password+are+required");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createActionClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      "/login?error=" +
        encodeURIComponent(error?.message || "Google sign-in is not configured yet."),
    );
  }

  redirect(data.url);
}

export async function signup(formData: FormData) {
  const supabase = await createActionClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  const fullName = String(formData.get("full_name") || "").trim();

  if (!email || !password) {
    redirect("/signup?error=Email+and+password+are+required");
  }
  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters");
  }
  if (password !== confirmPassword) {
    redirect("/signup?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName || undefined },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=" + encodeURIComponent("Check your email for a confirmation link."));
}

export async function logout() {
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createActionClient();

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  if (!email) {
    redirect("/forgot-password?error=Email+is+required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
  });

  if (error) {
    redirect("/forgot-password?error=" + encodeURIComponent(error.message));
  }

  redirect(
    "/forgot-password?message=" +
      encodeURIComponent("If an account exists for that email, a reset link is on its way."),
  );
}

export async function updatePassword(formData: FormData) {
  const supabase = await createActionClient();

  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirm_password") || "");
  if (!password || password.length < 8) {
    redirect("/reset-password?error=Password+must+be+at+least+8+characters");
  }
  if (password !== confirmPassword) {
    redirect("/reset-password?error=Passwords+do+not+match");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/reset-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

export async function magicLink(formData: FormData) {
  const supabase = await createActionClient();

  const email = formData.get("email") as string;
  if (!email) {
    redirect("/login?error=Email+is+required");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=" + encodeURIComponent("Check your email for the magic link."));
}
