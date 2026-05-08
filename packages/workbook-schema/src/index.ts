export const WORKBOOK_SCHEMA_VERSION = "0.2.0";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export type InteractionScoringMode =
  | "automatic"
  | "self_graded"
  | "grading_prompt";

export interface ScoringConfig {
  mode: InteractionScoringMode;
  points: number;
  rubric?: string[];
  gradingPrompt?: string;
  answerKey?: JsonValue;
}

export interface ChoiceOption {
  id: string;
  text: string;
}

export type RelationshipPattern =
  | "1:1"
  | "1:N"
  | "N:M"
  | "recursive hierarchy"
  | "recursive network"
  | "item-line"
  | "supertype-subtype"
  | "role-based user model";

export type InteractionKind =
  | "content_block"
  | "choice_interaction"
  | "multi_select_interaction"
  | "short_answer_interaction"
  | "written_response_interaction"
  | "sql_interaction"
  | "sql_choice_interaction"
  | "sql_short_answer_interaction"
  | "checklist_interaction"
  | "matching_interaction"
  | "matrix_interaction"
  | "case_card"
  | "design_judgment"
  | "relationship_pattern_activity"
  | "project_checkpoint";

export const INTERACTION_KINDS = [
  "content_block",
  "choice_interaction",
  "multi_select_interaction",
  "short_answer_interaction",
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
] as const satisfies readonly InteractionKind[];

export interface BaseWorkbookInteraction {
  id: string;
  kind: InteractionKind;
  title?: string;
  prompt?: string;
  caseRef?: string;
  scoring?: ScoringConfig;
  metadata?: JsonValue;
}

export interface ContentBlockInteraction extends BaseWorkbookInteraction {
  kind: "content_block";
  body: string;
}

export interface ChoiceInteraction extends BaseWorkbookInteraction {
  kind: "choice_interaction";
  options: ChoiceOption[];
}

export interface MultiSelectInteraction extends BaseWorkbookInteraction {
  kind: "multi_select_interaction";
  options: ChoiceOption[];
}

export interface ShortAnswerInteraction extends BaseWorkbookInteraction {
  kind: "short_answer_interaction";
  expectedFormat?: string;
}

export interface WrittenResponseInteraction extends BaseWorkbookInteraction {
  kind: "written_response_interaction";
  responseGuidance?: string;
}

export interface SqlInteraction extends BaseWorkbookInteraction {
  kind:
    | "sql_interaction"
    | "sql_choice_interaction"
    | "sql_short_answer_interaction";
  databaseRef: string;
  starterSql?: string;
  expectedColumns?: string[];
  options?: ChoiceOption[];
}

export interface ChecklistInteraction extends BaseWorkbookInteraction {
  kind: "checklist_interaction";
  criteria: ChoiceOption[];
}

export interface MatchingInteraction extends BaseWorkbookInteraction {
  kind: "matching_interaction";
  items: ChoiceOption[];
  matches: ChoiceOption[];
}

export interface MatrixInteraction extends BaseWorkbookInteraction {
  kind: "matrix_interaction";
  rows: string[];
  columns: string[];
  options: ChoiceOption[];
}

export interface CaseCardInteraction extends BaseWorkbookInteraction {
  kind: "case_card";
  case: {
    id: string;
    title: string;
    summary: string;
    roles?: string[];
    tables?: string[];
  };
}

export interface DesignJudgmentInteraction extends BaseWorkbookInteraction {
  kind: "design_judgment";
  decisionPrompt: string;
  tradeoffs: string[];
}

export interface RelationshipPatternActivityInteraction extends BaseWorkbookInteraction {
  kind: "relationship_pattern_activity";
  patterns: RelationshipPattern[];
  schemaContext: string;
}

export interface ProjectCheckpointInteraction extends BaseWorkbookInteraction {
  kind: "project_checkpoint";
  deliverable: string;
  selfCheckCriteria: string[];
}

export type WorkbookInteraction =
  | ContentBlockInteraction
  | ChoiceInteraction
  | MultiSelectInteraction
  | ShortAnswerInteraction
  | WrittenResponseInteraction
  | SqlInteraction
  | ChecklistInteraction
  | MatchingInteraction
  | MatrixInteraction
  | CaseCardInteraction
  | DesignJudgmentInteraction
  | RelationshipPatternActivityInteraction
  | ProjectCheckpointInteraction;

export interface WorkbookLesson {
  schemaVersion: typeof WORKBOOK_SCHEMA_VERSION;
  id: string;
  moduleNumber: number;
  lessonNumber: number;
  slug: string;
  title: string;
  overview?: string;
  caseRefs?: string[];
  interactions: WorkbookInteraction[];
}

export type LegacyInteractionType =
  | "text block"
  | "multiple choice"
  | "multiple answers"
  | "essay"
  | "short answer"
  | "short ansawer"
  | "sql"
  | "sql multiple choice"
  | "sql short answer"
  | "self check"
  | "matching"
  | "matrix multiple answers"
  | "checkbox";

export const LEGACY_INTERACTION_TYPES = [
  "text block",
  "multiple choice",
  "multiple answers",
  "essay",
  "short answer",
  "short ansawer",
  "sql",
  "sql multiple choice",
  "sql short answer",
  "self check",
  "matching",
  "matrix multiple answers",
  "checkbox",
] as const satisfies readonly LegacyInteractionType[];

export const legacyInteractionKindByType: Record<
  LegacyInteractionType,
  InteractionKind
> = {
  "text block": "content_block",
  "multiple choice": "choice_interaction",
  "multiple answers": "multi_select_interaction",
  essay: "written_response_interaction",
  "short answer": "short_answer_interaction",
  "short ansawer": "short_answer_interaction",
  sql: "sql_interaction",
  "sql multiple choice": "sql_choice_interaction",
  "sql short answer": "sql_short_answer_interaction",
  "self check": "checklist_interaction",
  matching: "matching_interaction",
  "matrix multiple answers": "matrix_interaction",
  checkbox: "checklist_interaction",
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LegacyValidationResult extends ValidationResult {
  normalizedKind?: InteractionKind;
}

export interface JsonSchemaDefinition {
  $schema: "https://json-schema.org/draft/2020-12/schema";
  title: string;
  type: "object";
  required: string[];
  properties: Record<string, JsonValue>;
  additionalProperties?: boolean;
}

export const legacyQuestionJsonSchema: JsonSchemaDefinition = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Learn Database Legacy Static Player Question",
  type: "object",
  required: ["id", "type", "prompt"],
  properties: {
    id: { type: ["string", "number"] },
    type: { enum: [...LEGACY_INTERACTION_TYPES] },
    prompt: { type: "string" },
    options: { type: "array" },
    solution: {},
    points: { type: "number" },
    response: {},
    hint: { type: "string" },
    feedback: { type: "string" },
    feedback_correct: { type: "string" },
    feedback_incorrect: { type: "string" },
    enable_showkeys: { type: "boolean" },
    bonus: { type: "boolean" },
  },
  additionalProperties: true,
};

export const workbookLessonJsonSchema: JsonSchemaDefinition = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Learn Database Workbook Lesson",
  type: "object",
  required: [
    "schemaVersion",
    "id",
    "moduleNumber",
    "lessonNumber",
    "slug",
    "title",
    "interactions",
  ],
  properties: {
    schemaVersion: { const: WORKBOOK_SCHEMA_VERSION },
    id: { type: "string" },
    moduleNumber: { type: "number" },
    lessonNumber: { type: "number" },
    slug: { type: "string" },
    title: { type: "string" },
    overview: { type: "string" },
    caseRefs: { type: "array", items: { type: "string" } },
    interactions: { type: "array" },
  },
  additionalProperties: false,
};

export function createLessonReference({
  moduleNumber,
  lessonNumber,
  slug,
}: Pick<WorkbookLesson, "moduleNumber" | "lessonNumber" | "slug">): string {
  return `module-${moduleNumber}.lesson-${moduleNumber}.${lessonNumber}.${slug}`;
}

export function validateLegacyQuestion(value: unknown): LegacyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Legacy question must be a JSON object."],
      warnings,
    };
  }

  requireStringOrNumber(value, "id", errors);
  requireString(value, "type", errors);
  requireString(value, "prompt", errors);

  const rawType = typeof value.type === "string" ? value.type : "";
  const legacyType = rawType as LegacyInteractionType;
  const normalizedKind = legacyInteractionKindByType[legacyType];

  if (!normalizedKind) {
    errors.push(
      `Unsupported legacy question type "${rawType}". Expected one of: ${LEGACY_INTERACTION_TYPES.join(", ")}.`,
    );
  }

  if (rawType === "short ansawer") {
    warnings.push(
      'Accepted legacy typo "short ansawer" as "short_answer_interaction".',
    );
  }

  if (
    hasPositiveNumber(value, "points") &&
    !hasRecognizedLegacyScoring(value)
  ) {
    warnings.push(
      "Legacy question has points but no explicit scoringMode; importer must add workbook scoring configuration.",
    );
  }

  if (
    normalizedKind === "choice_interaction" ||
    normalizedKind === "multi_select_interaction" ||
    normalizedKind === "sql_choice_interaction" ||
    normalizedKind === "checklist_interaction"
  ) {
    requireArray(value, "options", errors);
  }

  if (normalizedKind === "matching_interaction") {
    requireArray(value, "items", errors);
    requireArray(value, "matching_items", errors);
  }

  if (normalizedKind === "matrix_interaction") {
    requireArray(value, "rows", errors);
    requireArray(value, "cols", errors);
    requireArray(value, "options", errors);
  }

  if (
    normalizedKind !== "content_block" &&
    normalizedKind !== undefined &&
    !("solution" in value)
  ) {
    warnings.push(
      "Legacy graded/checkable question has no solution field; importer must provide automatic or self-graded scoring.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedKind,
  };
}

export function validateWorkbookLesson(value: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Workbook lesson must be a JSON object."],
      warnings,
    };
  }

  requireString(value, "schemaVersion", errors);
  requireString(value, "id", errors);
  requireNumber(value, "moduleNumber", errors);
  requireNumber(value, "lessonNumber", errors);
  requireString(value, "slug", errors);
  requireString(value, "title", errors);
  requireArray(value, "interactions", errors);

  if (
    typeof value.schemaVersion === "string" &&
    value.schemaVersion !== WORKBOOK_SCHEMA_VERSION
  ) {
    errors.push(
      `Unsupported workbook schemaVersion "${value.schemaVersion}". Expected "${WORKBOOK_SCHEMA_VERSION}".`,
    );
  }

  if (Array.isArray(value.interactions)) {
    value.interactions.forEach((interaction, index) => {
      const result = validateWorkbookInteraction(interaction);
      errors.push(
        ...result.errors.map((error) => `interactions[${index}]: ${error}`),
      );
      warnings.push(
        ...result.warnings.map(
          (warning) => `interactions[${index}]: ${warning}`,
        ),
      );
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateWorkbookInteraction(value: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Workbook interaction must be a JSON object."],
      warnings,
    };
  }

  requireString(value, "id", errors);
  requireString(value, "kind", errors);

  if (typeof value.kind === "string" && !isInteractionKind(value.kind)) {
    errors.push(
      `Unsupported workbook interaction kind "${value.kind}". Expected one of: ${INTERACTION_KINDS.join(", ")}.`,
    );
  }

  const scoring = value.scoring;
  const legacyPoints = typeof value.points === "number" ? value.points : 0;

  if (scoring !== undefined) {
    validateScoringConfig(scoring, errors);
  }

  if (legacyPoints > 0 && scoring === undefined) {
    errors.push(
      "Graded interaction has points but no scoring configuration. Use automatic, self_graded, or grading_prompt scoring.",
    );
  }

  if (isRecord(scoring) && scoring.mode === "grading_prompt") {
    requireString(scoring, "gradingPrompt", errors);
  }

  return { valid: errors.length === 0, errors, warnings };
}

function isInteractionKind(value: string): value is InteractionKind {
  return INTERACTION_KINDS.includes(value as InteractionKind);
}

function hasRecognizedLegacyScoring(value: Record<string, unknown>): boolean {
  return (
    typeof value.scoringMode === "string" ||
    isRecord(value.scoring) ||
    "solution" in value ||
    value.type === "essay" ||
    value.type === "self check"
  );
}

function validateScoringConfig(value: unknown, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push("scoring must be a JSON object.");
    return;
  }

  requireString(value, "mode", errors);
  requireNumber(value, "points", errors);

  if (
    typeof value.mode === "string" &&
    !["automatic", "self_graded", "grading_prompt"].includes(value.mode)
  ) {
    errors.push(
      `Unsupported scoring mode "${value.mode}". Expected automatic, self_graded, or grading_prompt.`,
    );
  }

  if (typeof value.points === "number" && value.points < 0) {
    errors.push("scoring.points must be zero or greater.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasPositiveNumber(
  value: Record<string, unknown>,
  key: string,
): boolean {
  return typeof value[key] === "number" && value[key] > 0;
}

function requireString(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
): void {
  if (typeof value[key] !== "string") {
    errors.push(`Missing or invalid string field "${key}".`);
  }
}

function requireStringOrNumber(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
): void {
  const field = value[key];
  if (typeof field !== "string" && typeof field !== "number") {
    errors.push(`Missing or invalid string/number field "${key}".`);
  }
}

function requireNumber(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
): void {
  if (typeof value[key] !== "number") {
    errors.push(`Missing or invalid number field "${key}".`);
  }
}

function requireArray(
  value: Record<string, unknown>,
  key: string,
  errors: string[],
): void {
  if (!Array.isArray(value[key])) {
    errors.push(`Missing or invalid array field "${key}".`);
  }
}
