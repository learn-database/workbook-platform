import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import {
  WORKBOOK_SCHEMA_VERSION,
  type InteractionKind,
  type InteractionScoringMode,
  type JsonValue,
  type WorkbookInteraction,
  type WorkbookLesson,
} from "@learn-database/workbook-schema";
import type { WorkbookPackage } from "../index.js";

const modulePath = "textbook/v4/modules/module-03-core-data-modeling/module.md";
const casePath = "textbook/v4/cases/lakeside-tutoring-center-primary-case.md";

const lessonConfigs = [
  {
    folder:
      "textbook/v4/modules/module-03-core-data-modeling/lessons/lesson-03-01-entities-attributes-and-identifiers",
    lessonNumber: 1,
    slug: "entities-attributes-and-identifiers",
    titlePrefix: "Lesson 3.1:",
  },
  {
    folder:
      "textbook/v4/modules/module-03-core-data-modeling/lessons/lesson-03-02-relationships-and-cardinality",
    lessonNumber: 2,
    slug: "relationships-and-cardinality",
    titlePrefix: "Lesson 3.2:",
  },
  {
    folder:
      "textbook/v4/modules/module-03-core-data-modeling/lessons/lesson-03-03-discovering-requirements-and-drafting-a-conceptual-erd",
    lessonNumber: 3,
    slug: "discovering-requirements-and-drafting-a-conceptual-erd",
    titlePrefix: "Lesson 3.3:",
  },
] as const;

const legacyLessonConfigs = [
  {
    source: "dbm-materials/src/lib/lessons/b21000601.json",
    stableId: "module-3.legacy-kce-6",
    lessonNumber: 4,
    slug: "knowledge-check-exercise-6",
    label: "Check Your Knowledge",
  },
] as const;

interface MarkdownSection {
  title: string;
  body: string;
}

interface LessonImportFlow {
  contractVersion: string;
  lessonId: string;
  source: string;
  title: string;
  playerMode: "segmented";
  defaultCaseRef?: string;
  segments: FlowSegment[];
}

interface FlowSegment {
  id: string;
  title: string;
  type: string;
  purpose: string;
  sections?: string[];
  interactions?: FlowInteraction[];
  wrapUp?: {
    source: string;
  };
}

interface FlowInteraction {
  id: string;
  source: string;
  kind: InteractionKind;
  scoringMode: InteractionScoringMode;
  points: number;
  placement: string;
  label?: string;
  tags?: string[];
}

interface LegacyLesson {
  id: number;
  title: string;
  overview?: string;
  summary?: string;
  questions: LegacyQuestion[];
}

interface LegacyQuestion {
  id: number;
  type: string;
  prompt: string;
  points?: number;
  response?: string;
  options?: Array<{
    id: number;
    text: string;
    value?: string;
    type?: string;
  }>;
  items?: Array<{ id: number; text: string; hint?: string }>;
  matching_items?: Array<{ id: number; text: string }>;
  rows?: string[];
  cols?: string[];
  solution?: JsonValue;
  hint?: string;
  feedback?: string;
  feedback_correct?: string;
  feedback_incorrect?: string;
  bonus?: boolean;
  enable_showkeys?: boolean;
}

export function buildModule3WorkbookPackageFromCourseMaterials({
  courseMaterialsRoot = defaultCourseMaterialsRoot(),
  legacyMaterialsRoot = defaultLegacyMaterialsRoot(),
}: {
  courseMaterialsRoot?: string;
  legacyMaterialsRoot?: string;
} = {}): WorkbookPackage {
  const moduleMarkdown = readSource(courseMaterialsRoot, modulePath);
  const caseMarkdown = readSource(courseMaterialsRoot, casePath);
  const moduleTitle = firstHeading(moduleMarkdown).replace(/^Module 3:\s*/, "");
  const caseSummary = sectionBody(caseMarkdown, "Initial Case Narrative");
  const context: BuildContext = {
    courseMaterialsRoot,
    legacyMaterialsRoot,
    caseCard: buildCaseCard(caseMarkdown, caseSummary),
  };

  return {
    packageVersion: "0.1.0",
    course: {
      id: "learn-database",
      slug: "learn-database",
      title: "Learn Database",
      description: "Interactive workbook course for database management.",
    },
    courseVersion: {
      versionLabel: "v4-draft",
      schemaVersion: WORKBOOK_SCHEMA_VERSION,
      sourceRepo: "learn-database/course-materials",
      sourceRef: "textbook/v4/modules/module-03-core-data-modeling",
    },
    cases: [
      {
        id: "lakeside-tutoring-center",
        title: "Lakeside Tutoring Center",
        summary: firstParagraph(caseSummary),
        primaryUse: "primary",
        content: {
          source: casePath,
          initialDesignGoal: sectionBody(caseMarkdown, "Initial Design Goal"),
          relationshipPatterns: sectionBody(
            caseMarkdown,
            "Relationship Patterns",
          ),
        },
      },
    ],
    modules: [
      {
        id: "module-3-core-data-modeling",
        number: 3,
        slug: "core-data-modeling",
        title: moduleTitle,
        overview: firstParagraph(
          sectionBody(moduleMarkdown, "Why This Module Matters"),
        ),
        lessons: [
          ...lessonConfigs.map((config) => buildLesson(config, context)),
          ...legacyLessonConfigs.map((config) =>
            buildLegacyLesson(config, context),
          ),
        ],
      },
    ],
  };
}

export function buildLesson32WorkbookPackageFromCourseMaterials({
  courseMaterialsRoot = defaultCourseMaterialsRoot(),
  legacyMaterialsRoot = defaultLegacyMaterialsRoot(),
}: {
  courseMaterialsRoot?: string;
  legacyMaterialsRoot?: string;
} = {}): WorkbookPackage {
  const workbookPackage = buildModule3WorkbookPackageFromCourseMaterials({
    courseMaterialsRoot,
    legacyMaterialsRoot,
  });
  const module = workbookPackage.modules[0];
  const lesson = module?.lessons.find((item) => item.lessonNumber === 2);

  if (!module || !lesson) {
    throw new Error("Unable to build Lesson 3.2 workbook package.");
  }

  return {
    ...workbookPackage,
    courseVersion: {
      ...workbookPackage.courseVersion,
      sourceRef:
        "textbook/v4/modules/module-03-core-data-modeling/lessons/lesson-03-02-relationships-and-cardinality/import.yml",
    },
    modules: [
      {
        ...module,
        lessons: [lesson],
      },
    ],
  };
}

interface BuildContext {
  courseMaterialsRoot: string;
  legacyMaterialsRoot: string;
  caseCard: WorkbookInteraction;
}

function buildLesson(
  config: (typeof lessonConfigs)[number],
  context: BuildContext,
): WorkbookLesson {
  const lessonPath = `${config.folder}/lesson.md`;
  const importPath = `${config.folder}/import.yml`;
  const lessonMarkdown = readSource(context.courseMaterialsRoot, lessonPath);
  const importFlow = readImportFlow(context.courseMaterialsRoot, importPath);
  const title = firstHeading(lessonMarkdown)
    .replace(config.titlePrefix, "")
    .trim();
  const overviewSource = importFlow.segments[0]?.sections?.[0];

  return {
    schemaVersion: WORKBOOK_SCHEMA_VERSION,
    id: importFlow.lessonId,
    moduleNumber: 3,
    lessonNumber: config.lessonNumber,
    slug: config.slug,
    title,
    overview: overviewSource
      ? firstParagraph(sectionBodyByPath(lessonMarkdown, overviewSource))
      : undefined,
    caseRefs: importFlow.defaultCaseRef ? [importFlow.defaultCaseRef] : [],
    interactions: buildSegmentedInteractions({
      importFlow,
      lessonMarkdown,
      caseCard: context.caseCard,
      legacyMaterialsRoot: context.legacyMaterialsRoot,
    }),
  };
}

function buildLegacyLesson(
  config: (typeof legacyLessonConfigs)[number],
  context: BuildContext,
): WorkbookLesson {
  const legacyLesson = readLegacyLessonFile(config.source, context);
  const interactions: WorkbookInteraction[] = [];

  if (legacyLesson.overview) {
    interactions.push(
      simpleContentBlock({
        id: `${config.stableId}.overview`,
        title: "Overview",
        body: htmlToMarkdown(legacyLesson.overview),
      }),
    );
  }

  interactions.push(
    ...legacyLesson.questions.map((question) =>
      legacyQuestionToInteraction(question, config),
    ),
  );

  if (legacyLesson.summary) {
    interactions.push(
      simpleContentBlock({
        id: `${config.stableId}.summary`,
        title: "Summary",
        body: htmlToMarkdown(legacyLesson.summary),
      }),
    );
  }

  return {
    schemaVersion: WORKBOOK_SCHEMA_VERSION,
    id: config.stableId,
    moduleNumber: 3,
    lessonNumber: config.lessonNumber,
    slug: config.slug,
    title: legacyLesson.title,
    overview: legacyLesson.overview
      ? firstParagraph(htmlToMarkdown(legacyLesson.overview))
      : undefined,
    interactions,
  };
}

function defaultCourseMaterialsRoot(): string {
  return (
    process.env.COURSE_MATERIALS_ROOT ??
    fileURLToPath(new URL("../../../../../course-materials", import.meta.url))
  );
}

function defaultLegacyMaterialsRoot(): string {
  return (
    process.env.LEGACY_DBM_MATERIALS_ROOT ??
    fileURLToPath(new URL("../../../../../../dbm-materials", import.meta.url))
  );
}

function readSource(root: string, relativePath: string): string {
  return readFileSync(resolve(root, relativePath), "utf8");
}

function readImportFlow(root: string, importPath: string): LessonImportFlow {
  const flow = YAML.parse(readSource(root, importPath)) as LessonImportFlow;

  if (!flow || flow.playerMode !== "segmented" || flow.segments.length === 0) {
    throw new Error(`Invalid lesson import contract at ${importPath}.`);
  }

  if (flow.source !== "lesson.md") {
    throw new Error(
      `Lesson import contract must use source "lesson.md"; found "${flow.source}".`,
    );
  }

  return flow;
}

function firstHeading(markdown: string): string {
  return (
    markdown
      .split(/\r?\n/)
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() ?? ""
  );
}

function buildSegmentedInteractions({
  importFlow,
  lessonMarkdown,
  caseCard,
  legacyMaterialsRoot,
}: {
  importFlow: LessonImportFlow;
  lessonMarkdown: string;
  caseCard: WorkbookInteraction;
  legacyMaterialsRoot: string;
}): WorkbookInteraction[] {
  return importFlow.segments.flatMap((segment) => {
    const interactions: WorkbookInteraction[] = [
      segmentContentBlock(importFlow, segment, lessonMarkdown),
    ];

    if (segment.id === "before-you-start" && importFlow.defaultCaseRef) {
      interactions.push({
        ...caseCard,
        id: `${importFlow.lessonId}.case-lakeside-tutoring-center`,
      });
    }

    interactions.push(
      ...(segment.interactions ?? []).map((interaction) =>
        flowInteraction(interaction, lessonMarkdown, legacyMaterialsRoot),
      ),
    );

    if (segment.wrapUp) {
      interactions.push(
        simpleContentBlock({
          id: `${importFlow.lessonId}.segment-${segment.id}-wrap-up`,
          title: leafTitle(segment.wrapUp.source),
          body: sectionBodyByPath(lessonMarkdown, segment.wrapUp.source),
        }),
      );
    }

    return interactions;
  });
}

function segmentContentBlock(
  importFlow: LessonImportFlow,
  segment: FlowSegment,
  markdown: string,
): WorkbookInteraction {
  const sectionBodies = (segment.sections ?? []).map((source) => {
    const body = sectionBodyByPath(markdown, source);
    return `### ${leafTitle(source)}\n\n${body}`;
  });

  return simpleContentBlock({
    id: `${importFlow.lessonId}.segment-${segment.id}`,
    title: segment.title,
    body: [`_${segment.purpose}_`, ...sectionBodies].join("\n\n"),
  });
}

function simpleContentBlock({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}): WorkbookInteraction {
  return {
    id,
    kind: "content_block",
    title,
    body,
  };
}

function buildCaseCard(
  caseMarkdown: string,
  caseSummary: string,
): WorkbookInteraction {
  return {
    id: "case-lakeside-tutoring-center",
    kind: "case_card",
    title: "Lakeside Tutoring Center",
    case: {
      id: "lakeside-tutoring-center",
      title: "Lakeside Tutoring Center",
      summary: firstParagraph(caseSummary),
      tables: extractBullets(sectionBody(caseMarkdown, "Initial Table Set")),
    },
  };
}

function flowInteraction(
  interaction: FlowInteraction,
  lessonMarkdown: string,
  legacyMaterialsRoot: string,
): WorkbookInteraction {
  if (interaction.source.startsWith("legacy:")) {
    return legacyInteraction(interaction, legacyMaterialsRoot);
  }

  const body = sectionBodyByPath(lessonMarkdown, interaction.source);
  const title = leafTitle(interaction.source);

  switch (interaction.kind) {
    case "written_response_interaction":
      return writtenResponseInteraction(interaction, title, body);
    case "design_judgment":
      return assignmentInteraction(interaction, title, body);
    case "project_checkpoint":
      return projectCheckpoint(interaction, title, body);
    default:
      throw new Error(
        `Unsupported import interaction kind "${interaction.kind}" for "${interaction.id}".`,
      );
  }
}

function writtenResponseInteraction(
  interaction: FlowInteraction,
  title: string,
  markdown: string,
): WorkbookInteraction {
  return {
    id: interaction.id,
    kind: "written_response_interaction",
    title,
    prompt: title,
    responseGuidance: markdown,
    scoring: {
      mode: interaction.scoringMode,
      points: interaction.points,
      rubric: [
        "Uses scenario evidence rather than surface wording alone.",
        "States the relevant database concept in plain language.",
        "Explains the judgment using the business rule or case detail.",
      ],
    },
  };
}

function assignmentInteraction(
  interaction: FlowInteraction,
  title: string,
  markdown: string,
): WorkbookInteraction {
  return {
    id: interaction.id,
    kind: "design_judgment",
    title: title.startsWith("Assignment") ? title : `Assignment: ${title}`,
    prompt: firstParagraph(markdown),
    decisionPrompt: markdown,
    tradeoffs: [
      "case evidence",
      "conceptual model boundaries",
      "truthful representation of the business work",
    ],
    scoring: {
      mode: interaction.scoringMode,
      points: interaction.points,
      gradingPrompt:
        "Evaluate whether the response uses scenario evidence, stays within the conceptual modeling boundary, and justifies the design judgment in plain business language.",
      rubric: [
        "Classifies or critiques the model element accurately.",
        "Uses direct evidence from the scenario.",
        "Explains why the decision represents the business truthfully.",
        "Avoids drifting into implementation-only detail unless explicitly requested.",
      ],
    },
  };
}

function projectCheckpoint(
  interaction: FlowInteraction,
  title: string,
  markdown: string,
): WorkbookInteraction {
  return {
    id: interaction.id,
    kind: "project_checkpoint",
    title: title.startsWith("Project Checkpoint")
      ? title
      : `Project Checkpoint: ${title}`,
    prompt: firstParagraph(markdown),
    deliverable: markdown,
    selfCheckCriteria: extractBullets(markdown),
    scoring: {
      mode: interaction.scoringMode,
      points: interaction.points,
      rubric: extractBullets(markdown),
    },
  };
}

function legacyInteraction(
  interaction: FlowInteraction,
  legacyMaterialsRoot: string,
): WorkbookInteraction {
  const question = readLegacyQuestion(interaction.source, legacyMaterialsRoot);

  if (interaction.kind !== "checklist_interaction") {
    throw new Error(
      `Legacy pilot currently supports checklist_interaction only; found "${interaction.kind}".`,
    );
  }

  const criteria = (question.options ?? []).map((option) => ({
    id: String(option.id),
    text: htmlToMarkdown(option.text),
  }));

  return {
    id: interaction.id,
    kind: "checklist_interaction",
    title: `${interaction.label ?? "Check Your Knowledge"}: ${legacyTitle(question)}`,
    prompt: [
      htmlToMarkdown(question.prompt),
      question.hint ? `**Hint:** ${htmlToMarkdown(question.hint)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    criteria,
    scoring: {
      mode: interaction.scoringMode,
      points: interaction.points,
      answerKey: question.solution,
      rubric: criteria.map((item) => item.text),
    },
    metadata: legacyQuestionMetadata(question),
  };
}

function legacyQuestionToInteraction(
  question: LegacyQuestion,
  config: (typeof legacyLessonConfigs)[number],
): WorkbookInteraction {
  if (question.type !== "self check") {
    throw new Error(
      `Legacy lesson "${config.source}" currently supports self check questions only; found "${question.type}" at q${question.id}.`,
    );
  }

  const criteria = (question.options ?? []).map((option) => ({
    id: String(option.id),
    text: htmlToMarkdown(option.text),
  }));

  return {
    id: `${config.stableId}.q${question.id}`,
    kind: "checklist_interaction",
    title: `${config.label}: ${legacyTitle(question)}`,
    prompt: [
      htmlToMarkdown(question.prompt),
      question.hint ? `**Hint:** ${htmlToMarkdown(question.hint)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    criteria,
    scoring: {
      mode: "self_graded",
      points: question.points ?? 1,
      answerKey: question.solution,
      rubric: criteria.map((item) => item.text),
    },
    metadata: legacyQuestionMetadata(question),
  };
}

function legacyQuestionMetadata(question: LegacyQuestion): JsonValue {
  return {
    sourceType: "legacy-question",
    legacyType: question.type,
    legacyId: question.id,
    response: question.response ? htmlToMarkdown(question.response) : "",
    options: (question.options ?? []).map((option) => ({
      id: String(option.id),
      text: htmlToMarkdown(option.text),
      value: option.value ?? "",
      type: option.type ?? "",
    })),
    items: (question.items ?? []).map((item) => ({
      id: String(item.id),
      text: htmlToMarkdown(item.text),
      hint: item.hint ? htmlToMarkdown(item.hint) : "",
    })),
    matchingItems: (question.matching_items ?? []).map((item) => ({
      id: String(item.id),
      text: htmlToMarkdown(item.text),
    })),
    rows: question.rows ?? [],
    columns: question.cols ?? [],
    hint: question.hint ? htmlToMarkdown(question.hint) : "",
    feedback: question.feedback ? htmlToMarkdown(question.feedback) : "",
    feedbackCorrect: question.feedback_correct
      ? htmlToMarkdown(question.feedback_correct)
      : "",
    feedbackIncorrect: question.feedback_incorrect
      ? htmlToMarkdown(question.feedback_incorrect)
      : "",
    bonus: question.bonus ?? false,
    enableShowKeys: question.enable_showkeys ?? false,
  };
}

function readLegacyLessonFile(
  source: string,
  context: BuildContext,
): LegacyLesson {
  const match = source.match(/^dbm-materials\/src\/lib\/lessons\/(.+)$/);

  if (!match) {
    throw new Error(`Invalid legacy lesson source "${source}".`);
  }

  const [, fileName] = match;
  const raw = readSource(
    context.legacyMaterialsRoot,
    `src/lib/lessons/${fileName}`,
  );
  const lessons = JSON.parse(raw) as LegacyLesson[];
  const lesson = lessons[0];

  if (!lesson) {
    throw new Error(`Legacy lesson file "${source}" did not contain a lesson.`);
  }

  return lesson;
}

function readLegacyQuestion(
  source: string,
  legacyMaterialsRoot: string,
): LegacyQuestion {
  const match = source.match(
    /^legacy:dbm-materials\/src\/lib\/lessons\/([^#]+)#q(\d+)$/,
  );

  if (!match) {
    throw new Error(`Invalid legacy exercise source "${source}".`);
  }

  const [, fileName, questionId] = match;
  const raw = readSource(legacyMaterialsRoot, `src/lib/lessons/${fileName}`);
  const lessons = JSON.parse(raw) as LegacyLesson[];
  const lesson = lessons[0];
  const question = lesson?.questions.find(
    (item) => item.id === Number(questionId),
  );

  if (!question) {
    throw new Error(`Missing legacy exercise source "${source}".`);
  }

  return question;
}

function legacyTitle(question: LegacyQuestion): string {
  if (question.bonus) {
    return `Q${question.id} Bonus`;
  }

  return `Q${question.id}`;
}

function sectionBodyByPath(markdown: string, source: string): string {
  const path = source.split(">").map((part) => part.trim());

  if (path.length === 1) {
    return requiredSectionBody(markdown, path[0] ?? source, 2);
  }

  if (path.length === 2) {
    const parentBody = requiredSectionBody(markdown, path[0] ?? source, 2);
    return requiredSectionBody(parentBody, path[1] ?? source, 3);
  }

  throw new Error(`Unsupported section path "${source}".`);
}

function requiredSectionBody(
  markdown: string,
  title: string,
  level: 2 | 3,
): string {
  const section = splitSections(markdown, level).find(
    (item) => item.title === title,
  );

  if (!section) {
    throw new Error(`Missing section "${title}".`);
  }

  return section.body;
}

function splitSections(markdown: string, level: 2 | 3): MarkdownSection[] {
  const marker = "#".repeat(level);
  const escapedMarker = marker.replaceAll("#", "\\#");
  const expression = new RegExp(`^${escapedMarker}\\s+(.+)$`, "gm");
  const matches = [...markdown.matchAll(expression)];

  return matches.map((match, index) => {
    const next = matches[index + 1];
    return {
      title: match[1]?.trim() ?? "",
      body: markdown
        .slice((match.index ?? 0) + match[0].length, next?.index)
        .trim(),
    };
  });
}

function sectionBody(markdown: string, title: string): string {
  const section = splitSections(markdown, 2).find(
    (item) => item.title === title,
  );
  return section?.body ?? "";
}

function firstParagraph(markdown: string): string {
  return (
    markdown
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find(
        (part) =>
          part.length > 0 && !part.startsWith("#") && !part.startsWith("- "),
      ) ?? ""
  );
}

function leafTitle(source: string): string {
  return source.split(">").at(-1)?.trim() ?? source;
}

function extractBullets(markdown: string): string[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s+/, "").replaceAll("`", ""));
}

function htmlToMarkdown(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(
        /<img[^>]*src=['"]([^'"]+)['"][^>]*alt=['"]([^'"]*)['"][^>]*>/gi,
        "\n\n![$2]($1)\n\n",
      )
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "### $1\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/?(ul|ol|p|strong|em|u|span|div|h[1-6])[^>]*>/gi, "")
      .replace(/<a[^>]*href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi, "$2 ($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&rarr;", "->")
    .replaceAll("&mdash;", "-")
    .replaceAll("&ndash;", "-")
    .replaceAll("&ldquo;", '"')
    .replaceAll("&rdquo;", '"')
    .replaceAll("&rsquo;", "'");
}
