"use server";
import { z } from "zod";
import { createEssayVersion, updateEssayPromptStatus } from "./actions";
export async function saveWritingRevision(
  id: string,
  content: string,
  notes: string,
): Promise<{ error?: string }> {
  const parsed = z
    .object({
      id: z.string().uuid(),
      content: z
        .string()
        .min(1)
        .max(1000000)
        .refine((value) => !!value.trim()),
      notes: z.string().max(10000),
    })
    .safeParse({ id, content, notes });
  if (!parsed.success)
    return { error: "Add some writing and keep the revision under one million characters." };
  try {
    await createEssayVersion({ essay_prompt_id: id, content, notes });
    return {};
  } catch {
    return {
      error:
        "We couldn’t confirm the save. Your writing is still here. Check the saved history before retrying after a connection interruption.",
    };
  }
}
export async function changeWritingStatus(id: string, status: string): Promise<{ error?: string }> {
  try {
    await updateEssayPromptStatus(id, status);
    return {};
  } catch (error) {
    return {
      error:
        error instanceof Error && /before marking|exceeds its submission limit/.test(error.message)
          ? error.message
          : "This writing stage couldn’t save. Please reload and try again.",
    };
  }
}
