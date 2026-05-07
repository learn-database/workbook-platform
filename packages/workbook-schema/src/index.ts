export const WORKBOOK_SCHEMA_VERSION = "0.1.0";

export type InteractionScoringMode = "automatic" | "self_graded";

export type InteractionKind =
  | "content_block"
  | "choice_interaction"
  | "multi_select_interaction"
  | "short_answer_interaction"
  | "written_response_interaction"
  | "checklist_interaction"
  | "case_card"
  | "design_judgment"
  | "project_checkpoint";

export interface WorkbookInteraction {
  id: string;
  kind: InteractionKind;
  title: string;
  scoringMode?: InteractionScoringMode;
  points?: number;
}

export interface WorkbookLesson {
  id: string;
  moduleNumber: number;
  lessonNumber: number;
  slug: string;
  title: string;
  interactions: WorkbookInteraction[];
}

export function createLessonReference({
  moduleNumber,
  lessonNumber,
  slug,
}: Pick<WorkbookLesson, "moduleNumber" | "lessonNumber" | "slug">): string {
  return `module-${moduleNumber}.lesson-${moduleNumber}.${lessonNumber}.${slug}`;
}
