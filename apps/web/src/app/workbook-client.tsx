"use client";

import { useState } from "react";
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
    options: Array<{
      id: string;
      text: string;
      value: string | null;
    }>;
  }>;
}

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

        <section className="container module-card-grid" aria-label="Modules">
          {courseModules.map((module) => {
            const isAvailable = module.number === 3 && lessons.length > 0;

            return (
              <article
                className={`student-module-card ${
                  isAvailable ? "available" : "locked"
                }`}
                key={module.number}
              >
                <div className="lesson-card-kicker">
                  <span>Module {module.number}</span>
                  <em>{isAvailable ? "Available" : "Not imported yet"}</em>
                </div>
                <h2>{module.title}</h2>
                <p>
                  {isAvailable
                    ? `${lessons.length} lessons are ready in this module.`
                    : "This module will appear here after its content is imported."}
                </p>
                <button
                  className={isAvailable ? "primary" : undefined}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onOpenModule(module.number)}
                >
                  {isAvailable ? "Open Module" : "Coming Later"}
                </button>
              </article>
            );
          })}
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
            item.type === "block" ? (
              <ContentBlockCard block={item.value} key={item.value.id} />
            ) : (
              <InteractionCard interaction={item.value} key={item.value.id} />
            ),
          )}
        </div>
      </section>
    </>
  );
}

function ContentBlockCard({
  block,
}: {
  block: LessonPreview["contentBlocks"][number];
}) {
  return (
    <article className="question-card content-card">
      <div className="question-header">
        <span className="badge">{block.kind}</span>
      </div>
      <h2>{block.title ?? "Content"}</h2>
      <MarkdownContent source={block.body} />
    </article>
  );
}

function InteractionCard({
  interaction,
}: {
  interaction: LessonPreview["interactions"][number];
}) {
  return (
    <article className="question-card" id={interaction.id}>
      <div className="question-header">
        <span className="badge">{interaction.kind}</span>
        <span className="schema-version">
          {interaction.scoringMode} · {interaction.points} pts
        </span>
      </div>

      <h2>{interactionTitle(interaction)}</h2>
      <MarkdownContent source={interaction.prompt} />

      {interaction.body && (
        <div className="prompt-box">
          <strong>Context</strong>
          <MarkdownContent source={interaction.body} />
        </div>
      )}

      <InteractionResponse interaction={interaction} />

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

function InteractionResponse({
  interaction,
}: {
  interaction: LessonPreview["interactions"][number];
}) {
  if (
    interaction.kind === "choice_interaction" ||
    interaction.kind === "multi_select_interaction" ||
    interaction.kind === "checklist_interaction"
  ) {
    return (
      <fieldset className="options-field">
        <legend>
          {interaction.kind === "checklist_interaction"
            ? "Use this checklist"
            : "Choose the best answer"}
        </legend>
        {interaction.options.map((option) => (
          <label key={option.id}>
            <input
              name={interaction.id}
              type={
                interaction.kind === "multi_select_interaction" ||
                interaction.kind === "checklist_interaction"
                  ? "checkbox"
                  : "radio"
              }
            />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
    );
  }

  if (interaction.kind === "project_checkpoint") {
    return (
      <div className="prompt-box">
        <strong>Checkpoint</strong>
        <p>
          Use this checkpoint to confirm your own work before moving to the next
          lesson.
        </p>
      </div>
    );
  }

  return (
    <>
      <label className="answer-label" htmlFor={`${interaction.id}-response`}>
        Response
      </label>
      <textarea
        id={`${interaction.id}-response`}
        placeholder="Write your response here. Persistence comes in the next runtime step."
      />
    </>
  );
}

function interactionTitle(
  interaction: LessonPreview["interactions"][number],
): string {
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
