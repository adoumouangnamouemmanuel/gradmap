import { describe, expect, it } from "vitest";
import { pageBounds, parsePage } from "./pagination";
describe("workspace pagination", () => {
  it("rejects invalid or excessive page parameters", () => { for (const value of ["-1", "1.5", "NaN", "10001", [], null]) expect(parsePage(value)).toBe(1); expect(parsePage("2")).toBe(2); });
  it("clamps pages after filtering and handles an empty result", () => { expect(pageBounds(25, 9)).toEqual({ page: 2, pages: 2, start: 25, end: 25 }); expect(pageBounds(0, 5)).toEqual({ page: 1, pages: 1, start: 0, end: 0 }); });
});
