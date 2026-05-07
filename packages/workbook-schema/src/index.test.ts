import { describe, expect, it } from "vitest";
import { WORKBOOK_SCHEMA_VERSION, createLessonReference } from "./index.js";

describe("workbook schema scaffold", () => {
  it("creates a stable lesson reference", () => {
    expect(
      createLessonReference({
        moduleNumber: 3,
        lessonNumber: 2,
        slug: "relationships-and-cardinality",
      }),
    ).toEqual("module-3.lesson-3.2.relationships-and-cardinality");
  });

  it("exposes an initial schema version", () => {
    expect(WORKBOOK_SCHEMA_VERSION).toBe("0.1.0");
  });
});
