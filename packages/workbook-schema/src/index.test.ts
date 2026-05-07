import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  INTERACTION_KINDS,
  WORKBOOK_SCHEMA_VERSION,
  createLessonReference,
  legacyQuestionJsonSchema,
  validateLegacyQuestion,
  validateWorkbookLesson,
  workbookLessonJsonSchema,
  type WorkbookLesson,
} from "./index.js";

const legacySampleDir = new URL("../fixtures/legacy-samples", import.meta.url);

function readLegacySamples(): Array<{ file: string; value: unknown }> {
  return readdirSync(legacySampleDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      value: JSON.parse(
        readFileSync(join(legacySampleDir.pathname, file), "utf8"),
      ),
    }));
}

describe("workbook schema", () => {
  it("creates a stable lesson reference", () => {
    expect(
      createLessonReference({
        moduleNumber: 3,
        lessonNumber: 2,
        slug: "relationships-and-cardinality",
      }),
    ).toEqual("module-3.lesson-3.2.relationships-and-cardinality");
  });

  it("exposes a versioned schema contract", () => {
    expect(WORKBOOK_SCHEMA_VERSION).toBe("0.2.0");
    expect(workbookLessonJsonSchema.properties.schemaVersion).toEqual({
      const: "0.2.0",
    });
  });

  it("represents static player and v4 interaction kinds", () => {
    expect(INTERACTION_KINDS).toEqual(
      expect.arrayContaining([
        "content_block",
        "choice_interaction",
        "multi_select_interaction",
        "written_response_interaction",
        "sql_interaction",
        "sql_choice_interaction",
        "sql_short_answer_interaction",
        "checklist_interaction",
        "matching_interaction",
        "matrix_interaction",
        "case_card",
        "design_judgment",
        "relationship_pattern_activity",
        "project_checkpoint",
      ]),
    );
  });

  it("validates static player sample JSON as legacy-compatible fixtures", () => {
    const samples = readLegacySamples();

    expect(samples.map(({ file }) => file)).toEqual([
      "essay.sample.json",
      "maquestion.sample.json",
      "mcquestion.sample.json",
      "shortanswer.sample.json",
      "sqlmcquestion.sample.json",
      "sqlquestion.sample.json",
      "sqlsaquestion.sample.json",
      "textblock.sample.json",
    ]);

    for (const sample of samples) {
      const result = validateLegacyQuestion(sample.value);
      expect(result.errors, sample.file).toEqual([]);
      expect(result.valid, sample.file).toBe(true);
      expect(result.normalizedKind, sample.file).toBeDefined();
    }
  });

  it("supports legacy renderer types that do not have static schema samples", () => {
    const fixtures = [
      {
        id: 1,
        type: "self check",
        prompt: "Check the diagram.",
        options: [{ id: 1, text: "All entities are named." }],
        solution: [1],
      },
      {
        id: 2,
        type: "matching",
        prompt: "Match terms.",
        items: [{ id: 1, text: "PK" }],
        matching_items: [{ id: 1, text: "Primary key" }],
        solution: ["1"],
      },
      {
        id: 3,
        type: "matrix multiple answers",
        prompt: "Classify patterns.",
        rows: ["Tutor"],
        cols: ["Relationship"],
        options: [{ id: 1, text: "1:N", value: "1N", type: "checkbox" }],
        solution: ["1N"],
      },
      {
        id: 4,
        type: "checkbox",
        prompt: "Confirm.",
        options: [{ id: 1, text: "I checked the SQL." }],
        solution: [1],
      },
    ];

    for (const fixture of fixtures) {
      expect(validateLegacyQuestion(fixture).errors, fixture.type).toEqual([]);
    }
  });

  it("returns clear compatibility errors for unsupported legacy types", () => {
    const result = validateLegacyQuestion({
      id: 99,
      type: "drag and drop",
      prompt: "Unsupported.",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain(
      "Unsupported legacy question type",
    );
    expect(legacyQuestionJsonSchema.properties.type).toEqual({
      enum: expect.arrayContaining([
        "sql",
        "matching",
        "matrix multiple answers",
      ]),
    });
  });

  it("requires scoring configuration for graded workbook interactions", () => {
    const lesson = {
      schemaVersion: WORKBOOK_SCHEMA_VERSION,
      id: "module-3.lesson-3.2.relationships-and-cardinality",
      moduleNumber: 3,
      lessonNumber: 2,
      slug: "relationships-and-cardinality",
      title: "Relationships and Cardinality",
      interactions: [
        {
          id: "q1",
          kind: "choice_interaction",
          prompt: "Choose the relationship pattern.",
          points: 1,
          options: [{ id: "a", text: "1:N" }],
        },
      ],
    };

    const result = validateWorkbookLesson(lesson);

    expect(result.valid).toBe(false);
    expect(result.errors.join("\n")).toContain("no scoring configuration");
  });

  it("accepts v4 self-guided lesson interactions with grading prompts", () => {
    const lesson: WorkbookLesson = {
      schemaVersion: WORKBOOK_SCHEMA_VERSION,
      id: "module-4.lesson-4.3.normalization-design-judgment",
      moduleNumber: 4,
      lessonNumber: 3,
      slug: "normalization-design-judgment",
      title: "Normalization Design Judgment",
      caseRefs: ["tutor-center", "lakeside-clinic"],
      interactions: [
        {
          id: "case-lakeside",
          kind: "case_card",
          title: "Lakeside Clinic",
          case: {
            id: "lakeside-clinic",
            title: "Lakeside Clinic",
            summary: "A clinic case for relationship-pattern comparison.",
            tables: ["users", "roles", "appointments"],
          },
        },
        {
          id: "judge-1",
          kind: "design_judgment",
          prompt: "Should this report table be normalized or denormalized?",
          decisionPrompt:
            "Defend the design in a read-mostly reporting scenario.",
          tradeoffs: [
            "update anomaly risk",
            "read performance",
            "source-of-truth clarity",
          ],
          scoring: {
            mode: "grading_prompt",
            points: 3,
            gradingPrompt:
              "Award credit when the student identifies the reporting database as read-mostly and explains why denormalization can be appropriate.",
            rubric: [
              "Identifies the workload as reporting/read-mostly.",
              "Explains the denormalization tradeoff.",
              "Connects the decision to source operational tables.",
            ],
          },
        },
        {
          id: "patterns-1",
          kind: "relationship_pattern_activity",
          prompt: "Label each relationship pattern in the case.",
          patterns: ["1:N", "N:M", "recursive hierarchy", "recursive network"],
          schemaContext: "Tutor Center redesign with users and roles.",
          scoring: {
            mode: "self_graded",
            points: 2,
            rubric: [
              "Labels recursive hierarchy as 1:N.",
              "Labels recursive network as N:M.",
            ],
          },
        },
        {
          id: "checkpoint-1",
          kind: "project_checkpoint",
          prompt: "Check your redesign before moving on.",
          deliverable: "Updated ERD notes",
          selfCheckCriteria: [
            "Users and roles are separated.",
            "Role-specific data remains in role-specific tables.",
          ],
          scoring: {
            mode: "self_graded",
            points: 1,
            rubric: ["Student confirms criteria before continuing."],
          },
        },
      ],
    };

    expect(validateWorkbookLesson(lesson)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });
});
