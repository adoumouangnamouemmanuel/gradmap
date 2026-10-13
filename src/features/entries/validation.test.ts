import { describe, expect, it } from "vitest";
import { entrySchemas, profileSchema } from "./schemas";
import { validateRelationships, type ParentLookup } from "./relationships";
import { changeDependentChoices } from "./choices";
const institution = "20000000-0000-4000-8000-000000000001";
const program = "30000000-0000-4000-8000-000000000001";
const application = "40000000-0000-4000-8000-000000000001";
const lookup: ParentLookup = async (table, id) =>
  table === "institutions" && id === institution
    ? { id }
    : table === "programs" && id === program
      ? { id, institution_id: institution }
      : table === "applications" && id === application
        ? { id, program_id: program }
        : null;
describe("entry dependencies and preferences", () => {
  it("clears dependent choices transitively when a parent changes", () => {
    const previous = { institution: "old", program: "old-program", application: "old-application", formats: ["online"], unrelated: "keep" };
    expect(changeDependentChoices([{ id: "institution" }, { id: "program", dependsOn: "institution" }, { id: "application", dependsOn: "program" }, { id: "formats", dependsOn: "application", multiple: true }], previous, "institution", "new")).toEqual({ institution: "new", program: "", application: "", formats: [], unrelated: "keep" });
    expect(previous.program).toBe("old-program");
  });
  it("allows standalone scholarships and preserves exact funding amounts", () => {
    expect(
      entrySchemas.scholarship.parse({ name: "Research award", amount: "12000.01" }).amount,
    ).toBe("12000.01");
    expect(entrySchemas.scholarship.safeParse({ name: "Award", amount: "12.001" }).success).toBe(
      false,
    );
    expect(
      entrySchemas.scholarship.safeParse({ name: "Award", program_ids: ["missing"] }).success,
    ).toBe(false);
  });
  it("requires the real parent for applications and programs", () => {
    expect(entrySchemas.application.safeParse({ program_id: "" }).success).toBe(false);
    expect(entrySchemas.program.safeParse({ name: "Program" }).success).toBe(false);
  });
  it("allows independent writing, documents and general tasks", () => {
    expect(entrySchemas.essay.safeParse({ title: "Reusable statement" }).success).toBe(true);
    expect(entrySchemas.document.safeParse({ name: "CV" }).success).toBe(true);
    expect(entrySchemas.task.safeParse({ title: "Research fields" }).success).toBe(true);
  });
  it("rejects orphan requirements and requests, and conflicting contexts", () => {
    expect(entrySchemas.requirement.safeParse({ requirement_name: "Transcript" }).success).toBe(
      false,
    );
    expect(entrySchemas.recommendation.safeParse({ recommender_id: institution }).success).toBe(
      false,
    );
    expect(
      entrySchemas.task.safeParse({
        title: "Task",
        application_id: application,
        document_id: institution,
      }).success,
    ).toBe(false);
  });
  it("checks the full institution–program–application chain", async () => {
    await expect(
      validateRelationships({ application_id: application }, lookup),
    ).resolves.toBeUndefined();
    await expect(
      validateRelationships({ program_id: program, institution_id: application }, lookup),
    ).rejects.toThrow();
  });
  it("rejects missing, archived and foreign-owned selections", async () => {
    await expect(validateRelationships({ program_id: application }, lookup)).rejects.toThrow();
    const archived: ParentLookup = async (table, id) =>
      table === "institutions" ? { id, archived_at: "2027-01-01" } : lookup(table, id);
    await expect(
      validateRelationships({ application_id: application }, archived),
    ).rejects.toThrow();
  });
  it("rejects whitespace titles, unsafe URLs, malformed IDs and invalid bounds", () => {
    expect(entrySchemas.institution.safeParse({ name: "  " }).success).toBe(false);
    expect(
      entrySchemas.application.safeParse({ program_id: program, portal_url: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(entrySchemas.application.safeParse({ program_id: program, priority: 6 }).success).toBe(
      false,
    );
  });
  it("strips client-supplied ownership and unexpected columns", () => {
    const parsed = entrySchemas.application.parse({
      program_id: program,
      user_id: application,
      submitted_at: "2027-01-01",
    });
    expect(parsed).not.toHaveProperty("user_id");
    expect(parsed).not.toHaveProperty("submitted_at");
  });
  it("preserves exact budget strings and validates countries, currencies and timezones", () => {
    const base = { full_name: "Student", timezone: "Africa/Accra", target_intake_year: 2027 };
    expect(
      profileSchema.parse({ ...base, annual_tuition_budget: "10000.01" }).annual_tuition_budget,
    ).toBe("10000.01");
    for (const invalid of [
      { preferred_countries: ["Invented country"] },
      { timezone: "Mars/Base" },
      { annual_tuition_budget: "-1" },
      { budget_currency: "ZZZ" },
    ])
      expect(profileSchema.safeParse({ ...base, ...invalid }).success).toBe(false);
  });
});
