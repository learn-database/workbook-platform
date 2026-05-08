"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface LessonPreview {
  id: string;
  courseVersion: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonNumber: number;
  slug: string;
  overview: string | null;
  schemaVersion: string;
  contentBlocks: Array<{
    id: string;
    sortOrder: number;
    kind: string;
    title: string | null;
    body: string;
  }>;
  interactions: Array<{
    id: string;
    sortOrder: number;
    kind: string;
    title: string | null;
    prompt: string;
    body: string | null;
    scoringMode: string;
    points: number;
    gradingPrompt: string | null;
    answerKey: string | null;
    metadata: unknown;
    options: Array<{
      id: string;
      text: string;
      value: string | null;
    }>;
  }>;
}

type ContentBlockPreview = LessonPreview["contentBlocks"][number];
type InteractionPreview = LessonPreview["interactions"][number];
type InteractionRenderer = (interaction: InteractionPreview) => ReactNode;

interface CourseModulePreview {
  number: number;
  title: string;
  status: "available" | "not_imported";
}

interface DashboardClientProps {
  activityRows: string[][];
  dashboardStats: string[][];
  lessons: LessonPreview[];
  moduleRows: string[][];
}

const courseModules: CourseModulePreview[] = [
  { number: 1, title: "The Whole Database Workflow", status: "not_imported" },
  { number: 2, title: "SQL Foundations", status: "not_imported" },
  { number: 3, title: "Core Data Modeling", status: "available" },
  { number: 4, title: "Design Logic", status: "not_imported" },
  { number: 5, title: "Design Artifacts", status: "not_imported" },
  { number: 6, title: "SQL Server Implementation", status: "not_imported" },
  {
    number: 7,
    title: "Database Operation and Control",
    status: "not_imported",
  },
  {
    number: 8,
    title: "Procedural Logic and Final Project Revision",
    status: "not_imported",
  },
];

const interactionRenderers: Record<string, InteractionRenderer> = {
  choice_interaction: (interaction) => (
    <ChoiceInteractionCard interaction={interaction} />
  ),
  multi_select_interaction: (interaction) => (
    <MultiSelectInteractionCard interaction={interaction} />
  ),
  short_answer_interaction: (interaction) => (
    <ShortAnswerInteractionCard interaction={interaction} />
  ),
  written_response_interaction: (interaction) => (
    <WrittenResponseInteractionCard interaction={interaction} />
  ),
  sql_interaction: (interaction) => (
    <SqlInteractionCard interaction={interaction} />
  ),
  sql_choice_interaction: (interaction) => (
    <SqlChoiceInteractionCard interaction={interaction} />
  ),
  sql_short_answer_interaction: (interaction) => (
    <SqlShortAnswerInteractionCard interaction={interaction} />
  ),
  checklist_interaction: (interaction) => (
    <ChecklistInteractionCard interaction={interaction} />
  ),
  matching_interaction: (interaction) => (
    <MatchingInteractionCard interaction={interaction} />
  ),
  matrix_interaction: (interaction) => (
    <MatrixInteractionCard interaction={interaction} />
  ),
  design_judgment: (interaction) => (
    <DesignJudgmentInteractionCard interaction={interaction} />
  ),
  relationship_pattern_activity: (interaction) => (
    <RelationshipPatternActivityCard interaction={interaction} />
  ),
  project_checkpoint: (interaction) => (
    <ProjectCheckpointInteractionCard interaction={interaction} />
  ),
};

export function DashboardClient({
  activityRows,
  dashboardStats,
  lessons,
  moduleRows,
}: DashboardClientProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [dashboardView, setDashboardView] = useState<"student" | "instructor">(
    "student",
  );
  const [selectedStudentModule, setSelectedStudentModule] = useState<
    number | null
  >(null);
  const lesson = lessons.find((item) => item.id === selectedLesson) ?? null;
  const isLessonOpen = lesson !== null;
  const currentVersion = lessons[0]?.courseVersion ?? null;

  return (
    <main>
      <nav className="topbar" aria-label="Workbook navigation">
        <div className="topbar-inner">
          <span className="brand">Learn Database Workbook</span>
          {!isLessonOpen && (
            <div className="role-switch" aria-label="Dashboard view">
              <button
                className={dashboardView === "student" ? "active" : undefined}
                type="button"
                onClick={() => setDashboardView("student")}
              >
                Student
              </button>
              <button
                className={
                  dashboardView === "instructor" ? "active" : undefined
                }
                type="button"
                onClick={() => setDashboardView("instructor")}
              >
                Instructor
              </button>
            </div>
          )}
        </div>
      </nav>

      {!isLessonOpen &&
        (dashboardView === "student" ? (
          <StudentDashboard
            currentVersion={currentVersion}
            lessons={lessons}
            onBackToCourse={() => setSelectedStudentModule(null)}
            onOpenLesson={setSelectedLesson}
            onOpenModule={setSelectedStudentModule}
            selectedModuleNumber={selectedStudentModule}
          />
        ) : (
          <InstructorDashboard
            activityRows={activityRows}
            currentVersion={currentVersion}
            dashboardStats={dashboardStats}
            lessons={lessons}
            moduleRows={moduleRows}
            onOpenLesson={setSelectedLesson}
          />
        ))}

      {isLessonOpen && lesson && (
        <LessonPlayer lesson={lesson} onBack={() => setSelectedLesson(null)} />
      )}

      <footer>
        {isLessonOpen
          ? "You've reached the end of the standalone Module 3 lesson preview."
          : dashboardView === "student" && selectedStudentModule === null
            ? "Select a module to continue."
            : "Select a lesson to open the workbook player."}
      </footer>
    </main>
  );
}

function StudentDashboard({
  currentVersion,
  lessons,
  onBackToCourse,
  onOpenLesson,
  onOpenModule,
  selectedModuleNumber,
}: {
  currentVersion: string | null;
  lessons: LessonPreview[];
  onBackToCourse: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenModule: (moduleNumber: number) => void;
  selectedModuleNumber: number | null;
}) {
  const totalInteractions = lessons.reduce(
    (sum, lesson) => sum + lesson.interactions.length,
    0,
  );
  const totalPoints = lessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.interactions.reduce(
        (lessonSum, interaction) => lessonSum + interaction.points,
        0,
      ),
    0,
  );
  const nextLesson = lessons[0];
  const selectedModule = selectedModuleNumber
    ? courseModules.find((module) => module.number === selectedModuleNumber)
    : null;
  const isModuleOpen = selectedModule?.number === 3;
  const availableModules = courseModules.filter(
    (module) => module.number === 3 && lessons.length > 0,
  );
  const futureModules = courseModules.filter(
    (module) => !availableModules.some((item) => item.number === module.number),
  );

  if (!isModuleOpen) {
    return (
      <>
        <section className="dashboard-hero student-hero">
          <div className="container">
            <div>
              <p className="section-label">Course home</p>
              <h1>Learn Database</h1>
              <p>
                Start with the course, open a module, then choose a lesson. This
                mirrors the way the workbook will sit inside Canvas while still
                working as a standalone course site.
              </p>
            </div>

            <div className="student-next-card">
              <span>Continue</span>
              <h2>{moduleDisplayTitle(nextLesson?.moduleTitle)}</h2>
              <p>
                {nextLesson
                  ? `${lessons.length} lessons · ${totalInteractions} activities ready`
                  : "No modules have been imported yet."}
              </p>
              <button
                className="primary"
                type="button"
                disabled={!nextLesson}
                onClick={() => nextLesson && onOpenModule(3)}
              >
                Open Module 3
              </button>
            </div>
          </div>
        </section>

        <section className="container student-summary">
          <article>
            <span>Workbook version</span>
            <strong>{currentVersion ?? "not imported"}</strong>
          </article>
          <article>
            <span>Modules</span>
            <strong>{courseModules.length}</strong>
          </article>
          <article>
            <span>Available modules</span>
            <strong>{nextLesson ? 1 : 0}</strong>
          </article>
          <article>
            <span>Available lessons</span>
            <strong>{lessons.length}</strong>
          </article>
        </section>

        <section
          className="container course-home-path"
          aria-label="Course path"
        >
          <span>Course</span>
          <strong>Learn Database</strong>
          <em>Choose a module to continue.</em>
        </section>

        <section className="container module-section" aria-label="Modules">
          <div className="module-section-header">
            <div>
              <p className="section-label">Available now</p>
              <h2>Start here</h2>
            </div>
            <span>{availableModules.length} module ready</span>
          </div>

          <div className="module-card-grid">
            {availableModules.map((module) => (
              <article
                className="student-module-card available"
                key={module.number}
              >
                <div className="lesson-card-kicker">
                  <span>Module {module.number}</span>
                  <em>Available</em>
                </div>
                <h2>{module.title}</h2>
                <p>
                  {lessons.length} lessons and {totalInteractions} activities
                  are ready in this module.
                </p>
                <button
                  className="primary"
                  type="button"
                  onClick={() => onOpenModule(module.number)}
                >
                  Open Module
                </button>
              </article>
            ))}
          </div>

          <details className="future-modules">
            <summary>Future modules not yet imported</summary>
            <div className="future-module-list">
              {futureModules.map((module) => (
                <article key={module.number}>
                  <span>Module {module.number}</span>
                  <strong>{module.title}</strong>
                  <em>Content is planned, but not available in this pilot.</em>
                </article>
              ))}
            </div>
          </details>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="dashboard-hero student-hero">
        <div className="container">
          <div>
            <button
              className="text-link"
              type="button"
              onClick={onBackToCourse}
            >
              Back to course
            </button>
            <p className="section-label">Module 3</p>
            <h1>Core data modeling workbook</h1>
            <p>
              Work through the lesson cards in order. Each lesson combines
              reading, guided judgment practice, and self-check activities so
              you can test your model before moving on.
            </p>
          </div>

          <div className="student-next-card">
            <span>Next step</span>
            <h2>{nextLesson?.lessonTitle ?? "Module not imported"}</h2>
            <p>
              {nextLesson
                ? `${nextLesson.interactions.length} activities · ${nextLesson.contentBlocks.length} reading blocks`
                : "Import Module 3 to begin the workbook preview."}
            </p>
            <button
              className="primary"
              type="button"
              disabled={!nextLesson}
              onClick={() => nextLesson && onOpenLesson(nextLesson.id)}
            >
              Start Lesson
            </button>
          </div>
        </div>
      </section>

      <section className="container student-summary">
        <article>
          <span>Workbook version</span>
          <strong>{currentVersion ?? "not imported"}</strong>
        </article>
        <article>
          <span>Lessons</span>
          <strong>{lessons.length}</strong>
        </article>
        <article>
          <span>Practice activities</span>
          <strong>{totalInteractions}</strong>
        </article>
        <article>
          <span>Available points</span>
          <strong>{totalPoints}</strong>
        </article>
      </section>

      <CourseNavigationPath
        lessons={lessons}
        onOpenLesson={onOpenLesson}
        variant="student"
      />

      <section className="container lesson-card-grid" aria-label="Lessons">
        {lessons.length === 0 && (
          <article className="empty-preview">
            <h2>No imported lesson available</h2>
            <p>
              The app is running, but the database does not yet contain the
              Module 3 import.
            </p>
          </article>
        )}

        {lessons.map((lesson) => (
          <article className="student-lesson-card" key={lesson.id}>
            <div className="lesson-card-kicker">
              <span>Lesson {lesson.lessonNumber}</span>
              <em>{lesson.interactions.length} activities</em>
            </div>
            <h2>{lesson.lessonTitle}</h2>
            <p>{lesson.overview ?? "Open the lesson to begin."}</p>
            <div className="lesson-card-meta">
              <span>{lesson.contentBlocks.length} readings</span>
              <span>{lesson.interactions.length} checks</span>
              <span>{lesson.schemaVersion}</span>
            </div>
            <button
              className="primary"
              type="button"
              onClick={() => onOpenLesson(lesson.id)}
            >
              Open Lesson
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

function InstructorDashboard({
  activityRows,
  currentVersion,
  dashboardStats,
  lessons,
  moduleRows,
  onOpenLesson,
}: {
  activityRows: string[][];
  currentVersion: string | null;
  dashboardStats: string[][];
  lessons: LessonPreview[];
  moduleRows: string[][];
  onOpenLesson: (lessonId: string) => void;
}) {
  const checklistCount = lessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.interactions.filter(
        (interaction) => interaction.kind === "checklist_interaction",
      ).length,
    0,
  );
  const gradingPromptCount = lessons.reduce(
    (sum, lesson) =>
      sum +
      lesson.interactions.filter(
        (interaction) => interaction.scoringMode === "grading_prompt",
      ).length,
    0,
  );

  return (
    <>
      <section className="dashboard-hero instructor-hero">
        <div className="container">
          <div>
            <p className="section-label">Instructor dashboard</p>
            <h1>Review the imported workbook package.</h1>
            <p>
              Use this view to inspect content readiness, import status,
              interaction coverage, and the currently loaded Module 3 pilot.
            </p>
          </div>

          <div className="stat-grid" aria-label="Platform status">
            {dashboardStats.map(([label, value]) => (
              <div className="stat-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container instructor-metrics">
        <article>
          <span>Current draft</span>
          <strong>{currentVersion ?? "not imported"}</strong>
        </article>
        <article>
          <span>Imported lessons</span>
          <strong>{lessons.length}</strong>
        </article>
        <article>
          <span>Self-checklists</span>
          <strong>{checklistCount}</strong>
        </article>
        <article>
          <span>AI/self grading prompts</span>
          <strong>{gradingPromptCount}</strong>
        </article>
      </section>

      <CourseNavigationPath
        lessons={lessons}
        onOpenLesson={onOpenLesson}
        variant="instructor"
      />

      <section className="container dashboard-grid instructor-grid">
        <article className="panel module-panel">
          <header className="panel-header">
            <h2>Build Path</h2>
            <span>v4 MVP</span>
          </header>
          <div className="module-list">
            {moduleRows.map(([module, title, status]) => (
              <div className="module-row" key={module}>
                <strong>{module}</strong>
                <span>{title}</span>
                <em>{status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="panel current-panel">
          <header className="panel-header">
            <h2>Module 3 Package</h2>
            <span>{currentVersion ?? "not imported"}</span>
          </header>
          <h3>
            {lessons.length > 0
              ? `${lessons.length} imported lessons`
              : "Module 3 not found"}
          </h3>
          <p>
            {lessons.length > 0
              ? "Preview any lesson exactly as the student player will render it."
              : "Import Module 3 before previewing it here. Run npm run import:module-3 -w @learn-database/content-import, then refresh this page."}
          </p>
          <div className="instructor-lesson-list">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onOpenLesson(lesson.id)}
              >
                <span>
                  Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                </span>
                <em>
                  {lesson.contentBlocks.length} blocks ·{" "}
                  {lesson.interactions.length} interactions
                </em>
              </button>
            ))}
          </div>
        </article>

        <article className="panel activity-panel">
          <header className="panel-header">
            <h2>Runtime Checks</h2>
            <span>local preview</span>
          </header>
          <ul>
            {activityRows.map(([label, status]) => (
              <li key={label}>
                <span>{label}</span>
                <code>{status}</code>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}

function CourseNavigationPath({
  lessons,
  onOpenLesson,
  variant,
}: {
  lessons: LessonPreview[];
  onOpenLesson: (lessonId: string) => void;
  variant: "student" | "instructor";
}) {
  const firstLesson = lessons[0];
  const moduleTitle = moduleDisplayTitle(firstLesson?.moduleTitle);
  const moduleNumber = moduleNumberFromTitle(firstLesson?.moduleTitle);
  const totalActivities = lessons.reduce(
    (sum, lesson) => sum + lesson.interactions.length,
    0,
  );

  return (
    <nav
      className={`container course-path ${variant}`}
      aria-label="Course navigation path"
    >
      <div className="path-line">
        <span className="path-node">Course: Learn Database</span>
        <span aria-hidden="true">/</span>
        <span className="path-node">
          Module {moduleNumber ?? 3}: {moduleTitle}
        </span>
        <span aria-hidden="true">/</span>
        <span className="path-current">
          Lessons ({lessons.length}) · Activities ({totalActivities})
        </span>
      </div>

      <div className="path-lesson-nav" aria-label="Module lessons">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onOpenLesson(lesson.id)}
          >
            <span>Lesson {lesson.lessonNumber}</span>
            {lesson.lessonTitle}
          </button>
        ))}
      </div>
    </nav>
  );
}

function LessonPlayer({
  lesson,
  onBack,
}: {
  lesson: LessonPreview;
  onBack: () => void;
}) {
  const orderedItems = [
    ...lesson.contentBlocks.map((block) => ({
      sortOrder: block.sortOrder,
      type: "block" as const,
      value: block,
    })),
    ...lesson.interactions.map((interaction) => ({
      sortOrder: interaction.sortOrder,
      type: "interaction" as const,
      value: interaction,
    })),
  ].sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <>
      <section className="schema-strip" aria-label="Database schema preview">
        <div className="container">
          <span className="strip-label">Course navigation</span>
          <div className="lesson-breadcrumb">
            <span>Learn Database</span>
            <span aria-hidden="true">/</span>
            <span>Module {moduleNumberFromTitle(lesson.moduleTitle) ?? 3}</span>
            <span aria-hidden="true">/</span>
            <strong>
              Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
            </strong>
          </div>
        </div>
      </section>

      <section className="score-strip" aria-label="Question score toolbar">
        <div className="container score-row">
          <div>
            <h2>
              Lesson Player <span>[Score: preview]</span>
            </h2>
            <div className="question-buttons" aria-label="Question buttons">
              {lesson.interactions.map((interaction, index) => (
                <a key={interaction.id} href={`#${interaction.id}`}>
                  {index + 1}
                </a>
              ))}
            </div>
          </div>
          <button type="button" className="back-button" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      </section>

      <section className="container lesson-shell">
        <aside className="lesson-index" aria-label="Lesson list">
          <h2>Lesson Content</h2>
          <ol>
            {orderedItems.map((item) => (
              <li key={item.value.id}>
                {item.type === "block"
                  ? (item.value.title ?? item.value.kind)
                  : interactionTitle(item.value)}
              </li>
            ))}
          </ol>
        </aside>

        <div className="lesson-stack">
          {orderedItems.map((item) =>
            item.type === "block"
              ? renderContentBlockCard(item.value)
              : renderInteractionCard(item.value),
          )}
        </div>
      </section>
    </>
  );
}

function renderContentBlockCard(block: ContentBlockPreview): ReactNode {
  if (block.kind === "case_card") {
    return <CaseCardBlock block={block} key={block.id} />;
  }

  return <ReadingBlock block={block} key={block.id} />;
}

function renderInteractionCard(interaction: InteractionPreview): ReactNode {
  const renderer = interactionRenderers[interaction.kind];
  return renderer ? (
    <div key={interaction.id}>{renderer(interaction)}</div>
  ) : (
    <div key={interaction.id}>
      <GenericInteractionCard interaction={interaction} />
    </div>
  );
}

function ReadingBlock({ block }: { block: ContentBlockPreview }) {
  return (
    <article className="question-card content-card" id={block.id}>
      <div className="question-header">
        <span className="badge badge-reading">Reading</span>
      </div>
      <h2>{block.title ?? "Content"}</h2>
      <MarkdownContent source={block.body} />
    </article>
  );
}

function CaseCardBlock({ block }: { block: ContentBlockPreview }) {
  return (
    <article className="question-card case-card-block" id={block.id}>
      <div className="question-header">
        <span className="badge badge-case">Case</span>
      </div>
      <h2>{block.title ?? "Case"}</h2>
      <MarkdownContent source={block.body} />
    </article>
  );
}

function InteractionShell({
  children,
  className,
  interaction,
  titlePrefix,
}: {
  children: ReactNode;
  className?: string;
  interaction: InteractionPreview;
  titlePrefix?: string;
}) {
  return (
    <article
      className={["question-card", "interaction-card", className]
        .filter(Boolean)
        .join(" ")}
      id={interaction.id}
    >
      <div className="question-header">
        <span className="badge">{blockTypeLabel(interaction.kind)}</span>
        <span className="schema-version">
          {interaction.scoringMode} · {interaction.points} pts
        </span>
      </div>

      <h2>
        {titlePrefix ? `${titlePrefix}: ` : ""}
        {interactionTitle(interaction)}
      </h2>
      <MarkdownContent source={interaction.prompt} />

      {interaction.body && (
        <div className="prompt-box">
          <strong>Context</strong>
          <MarkdownContent source={interaction.body} />
        </div>
      )}

      {children}

      <LegacySupportPanels interaction={interaction} />

      {interaction.gradingPrompt && (
        <details className="grading-prompt">
          <summary>Self-grading / grading prompt</summary>
          <MarkdownContent source={interaction.gradingPrompt} />
        </details>
      )}

      <div className="actions">
        <button type="button" className="primary">
          Check
        </button>
        <button type="button">Show Hint</button>
        <button type="button">Expected Result</button>
      </div>
    </article>
  );
}

function ChoiceInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="choice-card">
      <OptionField
        interaction={interaction}
        inputType="radio"
        legend="Choose one answer"
      />
    </InteractionShell>
  );
}

function MultiSelectInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="multi-select-card">
      <OptionField
        interaction={interaction}
        inputType="checkbox"
        legend="Choose all that apply"
      />
    </InteractionShell>
  );
}

function ChecklistInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  const sampleSolution = metadataString(interaction, "response");

  return (
    <InteractionShell interaction={interaction} className="checklist-card">
      {sampleSolution && (
        <details className="sample-solution-panel">
          <summary>Show sample solution before using the checklist</summary>
          <MarkdownContent source={sampleSolution} />
        </details>
      )}
      <OptionField
        interaction={interaction}
        inputType="checkbox"
        legend="Use this checklist"
      />
    </InteractionShell>
  );
}

function ShortAnswerInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="short-answer-card">
      <label className="answer-label" htmlFor={`${interaction.id}-response`}>
        Short answer
      </label>
      <input
        className="short-answer-input"
        id={`${interaction.id}-response`}
        placeholder="Enter a concise answer."
        type="text"
      />
    </InteractionShell>
  );
}

function WrittenResponseInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell
      interaction={interaction}
      className="written-response-card"
    >
      <WrittenResponseInput interaction={interaction} label="Response" />
    </InteractionShell>
  );
}

function DesignJudgmentInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell
      interaction={interaction}
      className="design-judgment-card"
    >
      <div className="judgment-box">
        <strong>Design judgment</strong>
        <p>
          State your decision, cite the case evidence, and explain the tradeoff.
        </p>
      </div>
      <WrittenResponseInput interaction={interaction} label="Your judgment" />
    </InteractionShell>
  );
}

function ProjectCheckpointInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell
      interaction={interaction}
      className="project-checkpoint-card"
    >
      <div className="prompt-box">
        <strong>Checkpoint</strong>
        <p>
          Use this checkpoint to confirm your own work before moving to the next
          lesson.
        </p>
      </div>
    </InteractionShell>
  );
}

function RelationshipPatternActivityCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell
      interaction={interaction}
      className="relationship-pattern-card"
    >
      <div className="pattern-box">
        <strong>Relationship pattern activity</strong>
        <p>
          Identify the relationship pattern, then explain the business rule that
          supports it.
        </p>
      </div>
      <WrittenResponseInput
        interaction={interaction}
        label="Pattern rationale"
      />
    </InteractionShell>
  );
}

function MatchingInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  const matches = metadataChoiceItems(interaction, "matchingItems");

  return (
    <InteractionShell interaction={interaction} className="matching-card">
      <div className="matching-preview">
        {interaction.options.length > 0 ? (
          interaction.options.map((option) => (
            <label key={option.id}>
              <span>{option.text}</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select a match
                </option>
                {matches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.text}
                  </option>
                ))}
              </select>
            </label>
          ))
        ) : (
          <p>Matching pairs will appear here when imported.</p>
        )}
      </div>
    </InteractionShell>
  );
}

function MatrixInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  const rows = metadataArray(interaction, "rows");
  const columns = metadataArray(interaction, "columns");

  return (
    <InteractionShell interaction={interaction} className="matrix-card">
      <div className="matrix-preview">
        <strong>Matrix response</strong>
        {rows.length > 0 && columns.length > 0 ? (
          <div className="matrix-table" aria-label="Matrix response preview">
            <table>
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  {columns.map((column) => (
                    <th key={column} scope="col">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <th scope="row">{row}</th>
                    {columns.map((column) => (
                      <td key={`${row}-${column}`}>
                        <input
                          aria-label={`${row}: ${column}`}
                          type="checkbox"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            Matrix rows and columns will render here when the imported
            interaction includes full matrix metadata.
          </p>
        )}
      </div>
    </InteractionShell>
  );
}

function SqlInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="sql-card">
      <SqlWorkspace interaction={interaction} />
      <ExpectedResultPanel interaction={interaction} />
    </InteractionShell>
  );
}

function SqlChoiceInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="sql-card">
      <SqlWorkspace interaction={interaction} />
      <ExpectedResultPanel interaction={interaction} />
      <OptionField
        interaction={interaction}
        inputType="radio"
        legend="Choose the SQL result"
      />
    </InteractionShell>
  );
}

function SqlShortAnswerInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction} className="sql-card">
      <SqlWorkspace interaction={interaction} />
      <ExpectedResultPanel interaction={interaction} />
      <label className="answer-label" htmlFor={`${interaction.id}-response`}>
        SQL result answer
      </label>
      <input
        className="short-answer-input"
        id={`${interaction.id}-response`}
        placeholder="Enter the expected result."
        type="text"
      />
    </InteractionShell>
  );
}

function GenericInteractionCard({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  return (
    <InteractionShell interaction={interaction}>
      <WrittenResponseInput interaction={interaction} label="Response" />
    </InteractionShell>
  );
}

function OptionField({
  inputType,
  interaction,
  legend,
}: {
  inputType: "checkbox" | "radio";
  interaction: InteractionPreview;
  legend: string;
}) {
  return (
    <fieldset className="options-field">
      <legend>{legend}</legend>
      {interaction.options.map((option) => (
        <label key={option.id}>
          <input name={interaction.id} type={inputType} />
          <span>{option.text}</span>
        </label>
      ))}
    </fieldset>
  );
}

function WrittenResponseInput({
  interaction,
  label,
}: {
  interaction: InteractionPreview;
  label: string;
}) {
  return (
    <>
      <label className="answer-label" htmlFor={`${interaction.id}-response`}>
        {label}
      </label>
      <textarea
        id={`${interaction.id}-response`}
        placeholder="Write your response here. Persistence comes in the next runtime step."
      />
    </>
  );
}

function SqlWorkspace({ interaction }: { interaction: InteractionPreview }) {
  return (
    <div className="sql-workspace">
      <label className="answer-label" htmlFor={`${interaction.id}-sql`}>
        SQL workspace
      </label>
      <textarea
        id={`${interaction.id}-sql`}
        placeholder="Write SQL here. Execution support comes in the next runtime step."
      />
    </div>
  );
}

function LegacySupportPanels({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  const hint = metadataString(interaction, "hint");
  const feedback = metadataString(interaction, "feedback");
  const feedbackCorrect = metadataString(interaction, "feedbackCorrect");
  const feedbackIncorrect = metadataString(interaction, "feedbackIncorrect");
  const isBonus = metadataBoolean(interaction, "bonus");
  const canShowKeys = metadataBoolean(interaction, "enableShowKeys");

  if (
    !hint &&
    !feedback &&
    !feedbackCorrect &&
    !feedbackIncorrect &&
    !isBonus &&
    !canShowKeys
  ) {
    return null;
  }

  return (
    <div className="support-panels">
      {isBonus && <span className="support-pill">Bonus question</span>}
      {canShowKeys && <span className="support-pill">Show keys enabled</span>}
      {hint && (
        <details className="support-panel">
          <summary>Legacy hint</summary>
          <MarkdownContent source={hint} />
        </details>
      )}
      {feedback && (
        <details className="support-panel">
          <summary>Legacy feedback</summary>
          <MarkdownContent source={feedback} />
        </details>
      )}
      {feedbackCorrect && (
        <details className="support-panel">
          <summary>Correct-answer feedback</summary>
          <MarkdownContent source={feedbackCorrect} />
        </details>
      )}
      {feedbackIncorrect && (
        <details className="support-panel">
          <summary>Incorrect-answer feedback</summary>
          <MarkdownContent source={feedbackIncorrect} />
        </details>
      )}
    </div>
  );
}

function ExpectedResultPanel({
  interaction,
}: {
  interaction: InteractionPreview;
}) {
  const answerKey = parseAnswerKey(interaction.answerKey);

  if (answerKey === null) {
    return null;
  }

  return (
    <details className="expected-result-panel">
      <summary>Expected result</summary>
      {isSqlResult(answerKey) ? (
        <div className="expected-result-table">
          <table>
            <thead>
              <tr>
                {answerKey.columns.map((column) => (
                  <th key={column} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {answerKey.values.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, valueIndex) => (
                    <td key={`${rowIndex}-${valueIndex}`}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre>{JSON.stringify(answerKey, null, 2)}</pre>
      )}
    </details>
  );
}

function metadataRecord(
  interaction: InteractionPreview,
): Record<string, unknown> {
  if (
    interaction.metadata &&
    typeof interaction.metadata === "object" &&
    !Array.isArray(interaction.metadata)
  ) {
    const record = interaction.metadata as Record<string, unknown>;

    if (
      record.metadata &&
      typeof record.metadata === "object" &&
      !Array.isArray(record.metadata)
    ) {
      return record.metadata as Record<string, unknown>;
    }

    return record;
  }

  return {};
}

function metadataString(interaction: InteractionPreview, key: string): string {
  const value = metadataRecord(interaction)[key];

  return typeof value === "string" ? value.trim() : "";
}

function metadataBoolean(
  interaction: InteractionPreview,
  key: string,
): boolean {
  return metadataRecord(interaction)[key] === true;
}

function metadataArray(interaction: InteractionPreview, key: string): string[] {
  const value = metadataRecord(interaction)[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function metadataChoiceItems(
  interaction: InteractionPreview,
  key: string,
): Array<{ id: string; text: string }> {
  const value = metadataRecord(interaction)[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;

      if (typeof record.id !== "string" || typeof record.text !== "string") {
        return null;
      }

      return { id: record.id, text: record.text };
    })
    .filter((item): item is { id: string; text: string } => item !== null);
}

function parseAnswerKey(answerKey: string | null): unknown {
  if (!answerKey) {
    return null;
  }

  try {
    return JSON.parse(answerKey) as unknown;
  } catch {
    return answerKey;
  }
}

function isSqlResult(
  value: unknown,
): value is { columns: string[]; values: unknown[][] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.columns) &&
    record.columns.every((column) => typeof column === "string") &&
    Array.isArray(record.values) &&
    record.values.every((row) => Array.isArray(row))
  );
}

function blockTypeLabel(kind: string): string {
  return kind.replaceAll("_", " ");
}

function interactionTitle(interaction: InteractionPreview): string {
  return interaction.title ?? interaction.id.replaceAll("-", " ");
}

function moduleDisplayTitle(moduleTitle: string | undefined): string {
  return (
    moduleTitle
      ?.replace(/^Module\s+\d+\s+Overview:\s*/i, "")
      .replace(/^Module\s+\d+:\s*/i, "")
      .trim() || "Core Data Modeling"
  );
}

function moduleNumberFromTitle(moduleTitle: string | undefined): number | null {
  const match = moduleTitle?.match(/Module\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function MarkdownContent({ source }: { source: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  );
}
