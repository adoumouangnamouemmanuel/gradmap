import { describe, expect, it } from "vitest";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { filterApplications, groupApplications, type ApplicationSummary } from "./workspace";

const application: ApplicationSummary = {
  id: "one",
  status: "preparing",
  priority: 3,
  programs: {
    name: "Computer Engineering",
    institutions: { name: "Example University", country_name: "Ghana" },
  },
};

describe("application workspace", () => {
  it("finds programs, institutions and countries regardless of case or surrounding whitespace", () => {
    for (const query of [" ENGINEERING ", "example", "GHANA"]) {
      expect(filterApplications([application], query, "all")).toEqual([application]);
    }
  });
  it("applies search and stage filters together", () => {
    expect(filterApplications([application], "Ghana", "submitted")).toEqual([]);
    expect(filterApplications([application], "Ghana", "preparing")).toEqual([application]);
  });
  it("keeps applications with missing related records accessible", () => {
    const incomplete = { ...application, programs: null };
    expect(filterApplications([incomplete], "", "all")).toEqual([incomplete]);
    expect(filterApplications([incomplete], "Ghana", "all")).toEqual([]);
  });
  it("places every supported status and unknown future statuses in exactly one board column", () => {
    const applications = [...APPLICATION_STATUSES, "future_status"].map((status) => ({
      ...application,
      id: status,
      status,
    }));
    const groups = groupApplications(applications);
    const grouped = groups.flatMap((group) => group.applications);
    expect(grouped).toHaveLength(applications.length);
    expect(new Set(grouped.map((item) => item.id)).size).toBe(applications.length);
    expect(
      groups
        .find((group) => group.label === "Other stages")
        ?.applications.map((item) => item.status),
    ).toEqual(["future_status"]);
  });
});
