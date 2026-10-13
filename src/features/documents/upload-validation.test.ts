import { describe, expect, it } from "vitest";
import { validateDocumentBytes } from "./upload-validation";
describe("document upload boundaries", () => {
  it("accepts a matching PDF header and rejects disguised active content", () => {
    const file = Buffer.from("%PDF-1.7\nexample");
    expect(() =>
      validateDocumentBytes(file, "application/pdf", "document.pdf", file.length),
    ).not.toThrow();
    expect(() =>
      validateDocumentBytes(Buffer.from("<script>"), "application/pdf", "document.pdf", 8),
    ).toThrow();
  });
  it("rejects extension mismatches, empty files and false sizes", () => {
    const file = Buffer.from("%PDF-1.7");
    expect(() =>
      validateDocumentBytes(file, "application/pdf", "document.html", file.length),
    ).toThrow();
    expect(() => validateDocumentBytes(new Uint8Array(), "application/pdf", "a.pdf", 0)).toThrow();
    expect(() => validateDocumentBytes(file, "application/pdf", "a.pdf", 999)).toThrow();
  });
  it("does not accept arbitrary ZIP archives as Word documents", () => {
    const file = Buffer.from([80, 75, 3, 4, 0, 0, 0, 0]);
    expect(() =>
      validateDocumentBytes(
        file,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "a.docx",
        file.length,
      ),
    ).toThrow();
  });
});
