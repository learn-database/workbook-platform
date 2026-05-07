import { WORKBOOK_SCHEMA_VERSION } from "@learn-database/workbook-schema";

const questionButtons = ["1", "2", "3", "4", "5"];

const checks = [
  ["Frontend", "Next.js shell"],
  ["API", "NestJS /health"],
  ["Local DB", "SQLite"],
  ["Schema", WORKBOOK_SCHEMA_VERSION],
];

export default function Home() {
  return (
    <main>
      <nav className="topbar" aria-label="Workbook navigation">
        <div className="topbar-inner">
          <span className="brand">Learn Database Workbook</span>
          <span className="topbar-note">Canvas-embedded runtime scaffold</span>
        </div>
      </nav>

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
          <h1>
            Questions <span>[Score: scaffold]</span>
          </h1>
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
            This screen is intentionally shaped like the existing static lesson
            player: top navigation, schema context, score controls, and a
            focused question area. The next implementation slice will replace
            this mock content with imported Lesson 3.2 blocks.
          </p>

          <div className="prompt-box">
            <strong>Current build check</strong>
            <ul>
              {checks.map(([label, value]) => (
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
            value="The scaffold is ready when the web app, API health endpoint, SQLite migration, and verification scripts all run from the same workspace."
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
