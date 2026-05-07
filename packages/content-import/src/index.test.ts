import { describe, expect, it } from "vitest";
import { lesson32WorkbookPackage } from "./fixtures/lesson-3-2.js";
import { legacyStaticLesson10 } from "./fixtures/legacy-static-lesson-10.js";
import {
  legacyQuestionToWorkbookKind,
  readLegacyStaticLesson,
  validateLegacyStaticLesson,
  validateWorkbookPackage,
  type WorkbookPackage,
} from "./index.js";

describe("content import validation", () => {
  it("validates the Lesson 3.2 workbook package", () => {
    const result = validateWorkbookPackage(lesson32WorkbookPackage);

    expect(result).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("reports missing prompts, missing scoring, broken case references, and duplicate IDs", () => {
    const invalidPackage: WorkbookPackage = structuredClone(
      lesson32WorkbookPackage,
    );
    const lesson = invalidPackage.modules[0]?.lessons[0];

    if (!lesson) {
      throw new Error("Expected fixture lesson.");
    }

    lesson.caseRefs = ["missing-case"];
    lesson.interactions.push({
      id: "classify-volunteer-event",
      kind: "choice_interaction",
      prompt: "",
      options: [{ id: "a", text: "A" }],
    });

    const result = validateWorkbookPackage(invalidPackage);

    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain("broken case reference");
    expect(result.errors.join("\n")).toContain("Duplicate stable ID");
    expect(result.errors.join("\n")).toContain("missing prompt");
    expect(result.errors.join("\n")).toContain("missing scoring configuration");
  });

  it("reads and validates a selected plain static player lesson JSON fixture", () => {
    const decoded = readLegacyStaticLesson(legacyStaticLesson10);
    const result = validateLegacyStaticLesson(legacyStaticLesson10);

    expect(decoded).toHaveLength(1);
    expect(decoded[0]?.title).toBe("Functional Dependencies");
    expect(decoded[0]?.questions).toHaveLength(2);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("maps legacy question types to workbook kinds for import planning", () => {
    expect(legacyQuestionToWorkbookKind("multiple choice")).toBe(
      "choice_interaction",
    );
    expect(legacyQuestionToWorkbookKind("sql")).toBe("sql_interaction");
    expect(legacyQuestionToWorkbookKind("self check")).toBe(
      "checklist_interaction",
    );
  });
});
