"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
      },
    },
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=" + encodeURIComponent("Check your email for a confirmation link."));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
  };

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/recovery`,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=" + encodeURIComponent("Check your email for a password reset link."));
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const data = {
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.updateUser(data);

  if (error) {
    redirect("/reset-password?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard?message=" + encodeURIComponent("Password updated successfully."));
}

export async function magicLink(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  };

  const { error } = await supabase.auth.signInWithOtp(data);

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/login?message=" + encodeURIComponent("Check your email for the magic link."));
}
