import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY is required"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("GradMap"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

let _serverEnv: ServerEnv | null = null;
let _publicEnv: PublicEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid server environment:\n${errors}`);
  }
  _serverEnv = result.data;
  return _serverEnv;
}

export function getPublicEnv(): PublicEnv {
  if (_publicEnv) return _publicEnv;

  const result = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  if (!result.success) {
    const errors = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid public environment:\n${errors}`);
  }
  _publicEnv = result.data;
  return _publicEnv;
}
