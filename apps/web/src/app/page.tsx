import { WORKBOOK_SCHEMA_VERSION } from "@learn-database/workbook-schema";

const dashboardStats = [
  ["Course", "Learn Database"],
  ["Runtime", "SQLite local"],
  ["Canvas", "LTI scaffold"],
  ["Schema", WORKBOOK_SCHEMA_VERSION],
];

const moduleRows = [
  ["M0", "Platform foundation", "In review"],
  ["M1", "Content import and schema", "Ready next"],
  ["M2", "Lesson runtime", "Backlog"],
  ["M3", "Canvas embedded LTI", "Backlog"],
];

const activityRows = [
  ["API health", "ok"],
  ["Web shell", "ok"],
  ["Local migration", "ok"],
  ["PostgreSQL parity", "planned"],
];

const questionButtons = ["1", "2", "3", "4", "5"];

const buildChecks = [
  ["Frontend", "Next.js shell"],
  ["API", "NestJS /health"],
  ["Local DB", "SQLite"],
  ["CI", "verify workflow"],
];

export default function Home() {
  return (
    <main>
      <nav className="topbar" aria-label="Workbook navigation">
        <div className="topbar-inner">
          <span className="brand">Learn Database Workbook</span>
          <span className="topbar-note">Dashboard · Canvas runtime</span>
        </div>
      </nav>

      <section className="dashboard-hero">
        <div className="container">
          <div>
            <p className="section-label">Course dashboard</p>
            <h1>Build, preview, and launch workbook lessons.</h1>
            <p>
              The dashboard is the control surface for the standalone site and
              the Canvas-embedded workbook. It keeps the old lesson-player
              rhythm, but gives students and instructors a place to start.
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
            <span>first vertical slice</span>
          </header>
          <h3>3.2 Relationships and Cardinality</h3>
          <p>
            Next target: import real Lesson 3.2 content, render it in this
            workbook surface, save attempts, and prepare the Canvas launch flow.
          </p>
          <div className="actions">
            <button type="button" className="primary">
              Open Preview
            </button>
            <button type="button">Content Package</button>
            <button type="button">Canvas Setup</button>
          </div>
        </article>

        <article className="panel activity-panel">
          <header className="panel-header">
            <h2>Runtime Checks</h2>
            <span>M0 scaffold</span>
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

      <section className="schema-strip" aria-label="Database schema preview">
        <div className="container">
          <span className="strip-label">[Database schema]</span>
          <code>
            Student(StudentID, Name, Email) | Session(SessionID, TutorID,
            StartTime) | Enrollment(StudentID, CourseID)
          </code>
        </div>
      </section>

      <section className="score-strip" aria-label="Question score toolbar">
        <div className="container score-row">
          <h2>
            Lesson Player Preview <span>[Score: scaffold]</span>
          </h2>
          <div className="question-buttons" aria-label="Question buttons">
            {questionButtons.map((item) => (
              <button key={item} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container lesson-shell">
        <aside className="lesson-index" aria-label="Lesson list">
          <h2>Seek Your Challenges</h2>
          <ol>
            <li className="active">3.2 Relationships and Cardinality</li>
            <li>Static player migration</li>
            <li>Content import check</li>
          </ol>
        </aside>

        <article className="question-card">
          <div className="question-header">
            <span className="badge">M0 scaffold</span>
            <span className="schema-version">
              Workbook schema {WORKBOOK_SCHEMA_VERSION}
            </span>
          </div>

          <h2>Workbook runtime foundation</h2>
          <p>
            The dashboard above is the course entry point. This panel previews
            the lesson-player area that will render imported content blocks,
            questions, hints, expected results, and self-grading prompts.
          </p>

          <div className="prompt-box">
            <strong>Current build check</strong>
            <ul>
              {buildChecks.map(([label, value]) => (
                <li key={label}>
                  <span>{label}</span>
                  <code>{value}</code>
                </li>
              ))}
            </ul>
          </div>

          <label className="answer-label" htmlFor="sample-answer">
            Short answer
          </label>
          <textarea
            id="sample-answer"
            readOnly
            value="The scaffold is ready when the dashboard, lesson player preview, API health endpoint, SQLite migration, and verification scripts all run from the same workspace."
          />

          <div className="actions">
            <button type="button" className="primary">
              Check
            </button>
            <button type="button">Show Hint</button>
            <button type="button">Expected Result</button>
          </div>
        </article>
      </section>

      <footer>You've reached the end of the scaffold preview.</footer>
    </main>
  );
}
