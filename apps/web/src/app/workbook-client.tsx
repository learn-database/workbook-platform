"use client";

import { useState } from "react";

export interface LessonPreview {
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

interface DashboardClientProps {
  activityRows: string[][];
  dashboardStats: string[][];
  lesson: LessonPreview | null;
  moduleRows: string[][];
}

export function DashboardClient({
  activityRows,
  dashboardStats,
  lesson,
  moduleRows,
}: DashboardClientProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const isLessonOpen = selectedLesson !== null;

  return (
    <main>
      <nav className="topbar" aria-label="Workbook navigation">
        <div className="topbar-inner">
          <span className="brand">Learn Database Workbook</span>
          <span className="topbar-note">
            Standalone preview · Canvas-ready shell
          </span>
        </div>
      </nav>

      <section className="dashboard-hero">
        <div className="container">
          <div>
            <p className="section-label">Course dashboard</p>
            <h1>Preview imported workbook lessons.</h1>
            <p>
              This dashboard now checks the local database for imported Lesson
              3.2 content. Open the lesson to verify the rendered content
              blocks, case card, and interactions that came through the import
              path.
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

      <section className="container dashboard-grid">
        <article className="panel module-panel">
          <header className="panel-header">
            <h2>Course Modules</h2>
            <span>v4 MVP path</span>
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
            <h2>Current Lesson</h2>
            <span>{lesson ? lesson.courseVersion : "not imported"}</span>
          </header>
          <h3>{lesson ? lesson.lessonTitle : "Lesson 3.2 not found"}</h3>
          <p>
            {lesson
              ? lesson.overview
              : "Import Lesson 3.2 before previewing it here. Run npm run import:lesson-3-2 -w @learn-database/content-import, then refresh this page."}
          </p>
          <div className="actions">
            <button
              type="button"
              className="primary"
              disabled={!lesson}
              onClick={() => setSelectedLesson("lesson-3.2")}
            >
              Open Lesson 3.2
            </button>
            <button type="button">Content Package</button>
            <button type="button">Canvas Setup</button>
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

      {!isLessonOpen && (
        <section className="container empty-preview">
          <h2>{lesson ? "Lesson imported" : "No imported lesson available"}</h2>
          <p>
            {lesson
              ? "Choose Lesson 3.2 from the dashboard to open the workbook player."
              : "The app is running, but the database does not yet contain the Lesson 3.2 import."}
          </p>
        </section>
      )}

      {isLessonOpen && lesson && (
        <LessonPlayer lesson={lesson} onBack={() => setSelectedLesson(null)} />
      )}

      <footer>
        {isLessonOpen
          ? "You've reached the end of the standalone Lesson 3.2 preview."
          : "Select a lesson to open the workbook player."}
      </footer>
    </main>
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
          <span className="strip-label">[Imported workbook lesson]</span>
          <code>
            {lesson.moduleTitle} / Lesson {lesson.lessonNumber}: {lesson.slug} /
            Version {lesson.courseVersion}
          </code>
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
      <p>{block.body}</p>
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
      <p>{interaction.prompt}</p>

      {interaction.body && (
        <div className="prompt-box">
          <strong>Context</strong>
          <p>{interaction.body}</p>
        </div>
      )}

      <InteractionResponse interaction={interaction} />

      {interaction.gradingPrompt && (
        <details className="grading-prompt">
          <summary>Self-grading / grading prompt</summary>
          <p>{interaction.gradingPrompt}</p>
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
    interaction.kind === "multi_select_interaction"
  ) {
    return (
      <fieldset className="options-field">
        <legend>Choose the best answer</legend>
        {interaction.options.map((option) => (
          <label key={option.id}>
            <input
              name={interaction.id}
              type={
                interaction.kind === "multi_select_interaction"
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
