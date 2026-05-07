import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@learn-database/db";
import {
  WORKBOOK_SCHEMA_VERSION,
  legacyInteractionKindByType,
  validateLegacyQuestion,
  validateWorkbookLesson,
  type ChoiceOption,
  type InteractionKind,
  type JsonValue,
  type LegacyInteractionType,
  type WorkbookInteraction,
  type WorkbookLesson,
} from "@learn-database/workbook-schema";

export interface WorkbookPackage {
  packageVersion: "0.1.0";
  course: {
    id: string;
    slug: string;
    title: string;
    description?: string;
  };
  courseVersion: {
    versionLabel: string;
    schemaVersion: typeof WORKBOOK_SCHEMA_VERSION;
    sourceRepo?: string;
    sourceRef?: string;
  };
  cases?: Array<{
    id: string;
    title: string;
    summary: string;
    primaryUse?: string;
    content?: JsonValue;
  }>;
  modules: Array<{
    id: string;
    number: number;
    slug: string;
    title: string;
    overview?: string;
    lessons: WorkbookLesson[];
  }>;
}

export interface ContentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  courseId: string;
  courseVersionId: string;
  versionLabel: string;
  moduleCount: number;
  lessonCount: number;
  interactionCount: number;
}

export interface LegacyStaticLesson {
  lessons_raw: string | unknown[];
}

interface LegacyQuestion {
  id: string | number;
  type: LegacyInteractionType;
  prompt: string;
  points?: number;
  options?: Array<{ id: string | number; text: string; value?: string }>;
  solution?: JsonValue;
  hint?: string;
  feedback_correct?: string;
  feedback_incorrect?: string;
}

interface LegacyLesson {
  id: string | number;
  title: string;
  overview?: string;
  summary?: string;
  schema?: string;
  questions: LegacyQuestion[];
}

export function validateWorkbookPackage(
  workbookPackage: WorkbookPackage,
): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();
  const caseIds = new Set((workbookPackage.cases ?? []).map((item) => item.id));

  requireString(workbookPackage.course.id, "course.id", errors);
  requireString(workbookPackage.course.slug, "course.slug", errors);
  requireString(workbookPackage.course.title, "course.title", errors);
  requireString(
    workbookPackage.courseVersion.versionLabel,
    "courseVersion.versionLabel",
    errors,
  );

  if (workbookPackage.courseVersion.schemaVersion !== WORKBOOK_SCHEMA_VERSION) {
    errors.push(
      `courseVersion.schemaVersion must be ${WORKBOOK_SCHEMA_VERSION}.`,
    );
  }

  trackId(workbookPackage.course.id, "course.id", seenIds, errors);

  for (const caseCard of workbookPackage.cases ?? []) {
    trackId(caseCard.id, `case ${caseCard.id}`, seenIds, errors);
    requireString(caseCard.title, `case ${caseCard.id}.title`, errors);
    requireString(caseCard.summary, `case ${caseCard.id}.summary`, errors);
  }

  for (const module of workbookPackage.modules) {
    trackId(module.id, `module ${module.id}`, seenIds, errors);
    requireString(module.slug, `module ${module.id}.slug`, errors);
    requireString(module.title, `module ${module.id}.title`, errors);

    for (const lesson of module.lessons) {
      trackId(lesson.id, `lesson ${lesson.id}`, seenIds, errors);
      const lessonValidation = validateWorkbookLesson(lesson);
      errors.push(
        ...lessonValidation.errors.map((error) => `${lesson.id}: ${error}`),
      );
      warnings.push(
        ...lessonValidation.warnings.map(
          (warning) => `${lesson.id}: ${warning}`,
        ),
      );

      for (const caseRef of lesson.caseRefs ?? []) {
        if (!caseIds.has(caseRef)) {
          errors.push(`${lesson.id}: broken case reference "${caseRef}".`);
        }
      }

      for (const interaction of lesson.interactions) {
        trackId(
          interaction.id,
          `interaction ${lesson.id}/${interaction.id}`,
          seenIds,
          errors,
        );
        validateInteractionForImport(interaction, caseIds, errors);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function decodeLegacyStaticLesson(
  legacyStaticLesson: LegacyStaticLesson,
): LegacyLesson[] {
  if (Array.isArray(legacyStaticLesson.lessons_raw)) {
    return legacyStaticLesson.lessons_raw as LegacyLesson[];
  }

  const decoded = Buffer.from(
    legacyStaticLesson.lessons_raw,
    "base64",
  ).toString("utf8");

  return JSON.parse(decoded) as LegacyLesson[];
}

export function validateLegacyStaticLesson(
  legacyStaticLesson: LegacyStaticLesson,
): ContentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lessons = decodeLegacyStaticLesson(legacyStaticLesson);

  for (const lesson of lessons) {
    if (!Array.isArray(lesson.questions)) {
      errors.push(`Legacy lesson ${lesson.id} has no questions array.`);
      continue;
    }

    for (const question of lesson.questions) {
      const result = validateLegacyQuestion(question);
      errors.push(...result.errors.map((error) => `q${question.id}: ${error}`));
      warnings.push(
        ...result.warnings.map((warning) => `q${question.id}: ${warning}`),
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export async function importWorkbookPackage(
  workbookPackage: WorkbookPackage,
  client: PrismaClient = defaultPrisma,
): Promise<ImportResult> {
  const validation = validateWorkbookPackage(workbookPackage);

  if (!validation.valid) {
    throw new Error(
      `Workbook package failed validation:\n${validation.errors.join("\n")}`,
    );
  }

  return client.$transaction(async (tx) => {
    await tx.course.upsert({
      where: { id: workbookPackage.course.id },
      create: {
        id: workbookPackage.course.id,
        slug: workbookPackage.course.slug,
        title: workbookPackage.course.title,
        description: workbookPackage.course.description,
      },
      update: {
        slug: workbookPackage.course.slug,
        title: workbookPackage.course.title,
        description: workbookPackage.course.description,
      },
    });

    const versionLabel = await nextDraftVersionLabel(
      tx,
      workbookPackage.course.id,
      workbookPackage.courseVersion.versionLabel,
    );
    const courseVersionId = stableDbId(
      workbookPackage.course.id,
      "version",
      versionLabel,
    );

    await tx.courseVersion.create({
      data: {
        id: courseVersionId,
        courseId: workbookPackage.course.id,
        versionLabel,
        status: "draft",
        schemaVersion: workbookPackage.courseVersion.schemaVersion,
        sourceRepo: workbookPackage.courseVersion.sourceRepo,
        sourceRef: workbookPackage.courseVersion.sourceRef,
      },
    });

    for (const caseCard of workbookPackage.cases ?? []) {
      await tx.case.create({
        data: {
          id: stableDbId(courseVersionId, "case", caseCard.id),
          courseVersionId,
          stableId: caseCard.id,
          title: caseCard.title,
          summary: caseCard.summary,
          primaryUse: caseCard.primaryUse,
          content: stringifyOptional(caseCard.content),
        },
      });
    }

    let lessonCount = 0;
    let interactionCount = 0;

    for (const module of workbookPackage.modules) {
      const moduleId = stableDbId(courseVersionId, "module", module.id);

      await tx.module.create({
        data: {
          id: moduleId,
          courseVersionId,
          number: module.number,
          slug: module.slug,
          title: module.title,
          overview: module.overview,
        },
      });

      for (const lesson of module.lessons) {
        const lessonId = stableDbId(courseVersionId, "lesson", lesson.id);
        lessonCount += 1;

        await tx.lesson.create({
          data: {
            id: lessonId,
            moduleId,
            stableId: lesson.id,
            lessonNumber: lesson.lessonNumber,
            slug: lesson.slug,
            title: lesson.title,
            overview: lesson.overview,
            contentVersion: lesson.schemaVersion,
          },
        });

        for (const [index, interaction] of lesson.interactions.entries()) {
          if (interaction.kind === "content_block") {
            await tx.contentBlock.create({
              data: {
                id: stableDbId(lessonId, "block", interaction.id),
                lessonId,
                stableId: interaction.id,
                sortOrder: index + 1,
                kind: interaction.kind,
                title: interaction.title,
                body: interaction.body,
                caseId: interaction.caseRef
                  ? stableDbId(courseVersionId, "case", interaction.caseRef)
                  : undefined,
              },
            });
            continue;
          }

          if (interaction.kind === "case_card") {
            await tx.contentBlock.create({
              data: {
                id: stableDbId(lessonId, "block", interaction.id),
                lessonId,
                stableId: interaction.id,
                sortOrder: index + 1,
                kind: interaction.kind,
                title: interaction.title ?? interaction.case.title,
                body: interaction.case.summary,
                caseId: stableDbId(
                  courseVersionId,
                  "case",
                  interaction.case.id,
                ),
              },
            });
            continue;
          }

          const interactionId = stableDbId(
            lessonId,
            "interaction",
            interaction.id,
          );
          interactionCount += 1;

          await tx.interaction.create({
            data: {
              id: interactionId,
              lessonId,
              stableId: interaction.id,
              kind: interaction.kind,
              sortOrder: index + 1,
              title: interaction.title,
              prompt: interaction.prompt ?? interaction.title ?? interaction.id,
              body: interactionBody(interaction),
              caseId: interaction.caseRef
                ? stableDbId(courseVersionId, "case", interaction.caseRef)
                : undefined,
              scoringMode: interaction.scoring?.mode ?? "self_graded",
              points: interaction.scoring?.points ?? 0,
              gradingPrompt: interaction.scoring?.gradingPrompt,
              answerKey: stringifyOptional(interaction.scoring?.answerKey),
              metadata: JSON.stringify(interaction),
            },
          });

          for (const [optionIndex, option] of interactionOptions(
            interaction,
          ).entries()) {
            await tx.interactionOption.create({
              data: {
                id: stableDbId(interactionId, "option", option.id),
                interactionId,
                stableId: option.id,
                sortOrder: optionIndex + 1,
                text: option.text,
                value: option.id,
              },
            });
          }

          if (interaction.scoring?.rubric?.length) {
            await tx.rubric.create({
              data: {
                id: stableDbId(courseVersionId, "rubric", interaction.id),
                courseVersionId,
                interactionId,
                stableId: interaction.id,
                title: interaction.title ?? interaction.id,
                criteria: JSON.stringify(interaction.scoring.rubric),
                scoringPrompt: interaction.scoring.gradingPrompt,
              },
            });
          }
        }
      }
    }

    await tx.publishRun.create({
      data: {
        id: stableDbId(courseVersionId, "publish-run", "import"),
        courseVersionId,
        status: "imported",
        sourceSummary: workbookPackage.courseVersion.sourceRef,
        log: JSON.stringify({ warnings: validation.warnings }),
      },
    });

    return {
      courseId: workbookPackage.course.id,
      courseVersionId,
      versionLabel,
      moduleCount: workbookPackage.modules.length,
      lessonCount,
      interactionCount,
    };
  });
}

async function nextDraftVersionLabel(
  client: Pick<PrismaClient, "courseVersion">,
  courseId: string,
  baseLabel: string,
): Promise<string> {
  const existing = await client.courseVersion.findMany({
    where: {
      courseId,
      versionLabel: {
        startsWith: baseLabel,
      },
    },
    select: { versionLabel: true },
  });
  const existingLabels = new Set(existing.map((item) => item.versionLabel));

  if (!existingLabels.has(baseLabel)) {
    return baseLabel;
  }

  let suffix = 2;
  while (existingLabels.has(`${baseLabel}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseLabel}-${suffix}`;
}

function validateInteractionForImport(
  interaction: WorkbookInteraction,
  caseIds: Set<string>,
  errors: string[],
): void {
  if (
    "caseRef" in interaction &&
    interaction.caseRef &&
    !caseIds.has(interaction.caseRef)
  ) {
    errors.push(
      `${interaction.id}: broken case reference "${interaction.caseRef}".`,
    );
  }

  if (
    interaction.kind !== "content_block" &&
    interaction.kind !== "case_card"
  ) {
    if (!interaction.prompt || interaction.prompt.trim().length === 0) {
      errors.push(`${interaction.id}: missing prompt.`);
    }

    if (!interaction.scoring) {
      errors.push(`${interaction.id}: missing scoring configuration.`);
    }
  }

  if (
    interaction.scoring?.mode === "grading_prompt" &&
    !interaction.scoring.gradingPrompt
  ) {
    errors.push(
      `${interaction.id}: grading_prompt scoring requires gradingPrompt.`,
    );
  }
}

function interactionBody(interaction: WorkbookInteraction): string | undefined {
  if ("responseGuidance" in interaction) {
    return interaction.responseGuidance;
  }

  if ("schemaContext" in interaction) {
    return interaction.schemaContext;
  }

  if ("decisionPrompt" in interaction) {
    return interaction.decisionPrompt;
  }

  if ("deliverable" in interaction) {
    return interaction.deliverable;
  }

  return undefined;
}

function interactionOptions(interaction: WorkbookInteraction): ChoiceOption[] {
  if ("options" in interaction && Array.isArray(interaction.options)) {
    return interaction.options;
  }

  if ("criteria" in interaction) {
    return interaction.criteria;
  }

  if ("items" in interaction) {
    return interaction.items;
  }

  return [];
}

function trackId(
  id: string,
  label: string,
  seenIds: Set<string>,
  errors: string[],
): void {
  if (seenIds.has(id)) {
    errors.push(`Duplicate stable ID "${id}" at ${label}.`);
    return;
  }

  seenIds.add(id);
}

function requireString(
  value: unknown,
  fieldName: string,
  errors: string[],
): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`Missing required string field ${fieldName}.`);
  }
}

function stableDbId(...parts: string[]): string {
  return parts.join(":").replace(/[^a-zA-Z0-9:._-]/g, "-");
}

function stringifyOptional(value: JsonValue | undefined): string | undefined {
  return value === undefined ? undefined : JSON.stringify(value);
}

export function legacyQuestionToWorkbookKind(
  type: LegacyInteractionType,
): InteractionKind {
  return legacyInteractionKindByType[type];
}
