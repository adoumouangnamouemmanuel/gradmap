import { z } from "zod";
export const materialWorkspaceSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(), kind: z.enum(["document", "requirement", "essay", "recommender", "recommendation"]), title: z.string(), subtitle: z.string(), status: z.string(),
    applicationId: z.string().uuid().nullable(), href: z.string().nullable(), documentType: z.string().nullable().optional(), satisfiedBy: z.string().uuid().nullable().optional(), personId: z.string().uuid().nullable().optional(),
  })).max(24),
  versions: z.array(z.object({ id: z.string().uuid(), document_id: z.string().uuid(), file_name: z.string(), version_number: z.number().int().positive() })).max(524),
  documentChoices: z.array(z.object({ id: z.string().uuid(), documentType: z.string() })).max(500),
  page: z.number().int().positive(), pageSize: z.literal(24), total: z.number().int().nonnegative(), truncated: z.boolean(),
});
export type MaterialWorkspaceData = z.infer<typeof materialWorkspaceSchema>;
export type MaterialItem = MaterialWorkspaceData["items"][number];
export type MaterialKind = MaterialItem["kind"];
