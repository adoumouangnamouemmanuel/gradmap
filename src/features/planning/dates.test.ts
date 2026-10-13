import { describe, expect, it } from "vitest";
import { dateKey, localToInstant, monthDays, moveMonth } from "./dates";
describe("planning dates", () => {
  it("rejects rolled-over dates in explicit UTC instants", () => {
    expect(() => localToInstant("2027-02-30T12:00Z", "UTC")).toThrow("valid date");
  });
  it("uses the selected timezone across date boundaries", () => {
    expect(dateKey("2027-01-01T01:00:00Z", "America/New_York")).toBe("2026-12-31");
  });
  it("converts local times independently of the server timezone", () => {
    expect(localToInstant("2027-06-01T17:00", "Africa/Accra")).toBe("2027-06-01T17:00:00.000Z");
    expect(localToInstant("2027-06-01T17:00", "America/New_York")).toBe("2027-06-01T21:00:00.000Z");
  });
  it("rejects nonexistent dates and daylight-saving gaps", () => {
    expect(() => localToInstant("2027-02-30T12:00", "UTC")).toThrow();
    expect(() => localToInstant("2027-03-14T02:30", "America/New_York")).toThrow("does not exist");
  });
  it("rejects ambiguous daylight-saving times", () => {
    expect(() => localToInstant("2027-11-07T01:30", "America/New_York")).toThrow("occurs twice");
  });
  it("supports explicit instants and non-hour offsets", () => {
    expect(localToInstant("2027-01-01T12:00+05:30", "Asia/Kolkata")).toBe(
      "2027-01-01T06:30:00.000Z",
    );
    expect(localToInstant("2027-01-01T12:00", "Asia/Kolkata")).toBe("2027-01-01T06:30:00.000Z");
  });
  it("builds complete Monday-first grids through leap years and year boundaries", () => {
    const days = monthDays("2028-02");
    expect(days).toHaveLength(42);
    expect(days).toContain("2028-02-29");
    expect(new Date(`${days[0]}T12:00Z`).getUTCDay()).toBe(1);
    expect(moveMonth("2027-01", -1)).toBe("2026-12");
  });
});
