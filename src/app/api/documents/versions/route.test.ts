import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const fixture = vi.hoisted(() => ({ getUser: vi.fn(), maybeSingle: vi.fn(), save: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createActionClient: async () => ({
  auth: { getUser: fixture.getUser },
  from: () => { const query = { select: () => query, eq: () => query, is: () => query, maybeSingle: fixture.maybeSingle }; return query; },
}) }));
vi.mock("@/features/documents/actions", () => ({ createDocumentVersion: fixture.save }));
import { POST } from "./route";
const owner = "10000000-0000-4000-8000-000000000001";
const document = "60000000-0000-4000-8000-000000000001";
const metadata = { document_id: document, file_name: "file.pdf", file_size: 10, mime_type: "application/pdf", storage_path: `${owner}/${document}/file.pdf` };
function request(body: unknown, origin = "http://localhost:3000") { return new NextRequest("http://localhost:3000/api/documents/versions", { method: "POST", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) }); }
beforeEach(() => { vi.clearAllMocks(); fixture.getUser.mockResolvedValue({ data: { user: { id: owner } } }); fixture.maybeSingle.mockResolvedValue({ data: { id: document }, error: null }); fixture.save.mockResolvedValue({ id: "version" }); });
describe("private document version endpoint", () => {
  it("requires authentication before accessing documents", async () => { fixture.getUser.mockResolvedValue({ data: { user: null } }); expect((await POST(request(metadata))).status).toBe(401); expect(fixture.save).not.toHaveBeenCalled(); });
  it("rejects cross-origin mutations", async () => { expect((await POST(request(metadata, "https://another.example"))).status).toBe(403); expect(fixture.getUser).not.toHaveBeenCalled(); });
  it("rejects malformed metadata and foreign file paths", async () => { expect((await POST(request({ ...metadata, file_size: -1 }))).status).toBe(400); expect((await POST(request({ ...metadata, storage_path: `another/${document}/file.pdf` }))).status).toBe(404); expect(fixture.save).not.toHaveBeenCalled(); });
  it("does not save unavailable or archived documents", async () => { fixture.maybeSingle.mockResolvedValue({ data: null, error: null }); expect((await POST(request(metadata))).status).toBe(404); expect(fixture.save).not.toHaveBeenCalled(); });
  it("uses the atomic writer and strips ownership supplied by the client", async () => { const response = await POST(request({ ...metadata, user_id: "another-owner", current_version_id: "fake" })); expect(response.status).toBe(201); expect(response.headers.get("Cache-Control")).toBe("private, no-store"); expect(fixture.save).toHaveBeenCalledWith(metadata); });
  it("does not expose provider error details", async () => { fixture.save.mockRejectedValue(new Error("Internal database detail")); const response = await POST(request(metadata)); expect(response.status).toBe(503); expect(await response.text()).not.toContain("Internal database detail"); });
});
