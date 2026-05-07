import { WORKBOOK_SCHEMA_VERSION } from "@learn-database/workbook-schema";

const foundationItems = [
  ["Frontend", "Next.js workbook shell"],
  ["Backend", "NestJS API scaffold"],
  ["Database", "SQLite local, PostgreSQL production"],
  ["Schema", `Workbook schema ${WORKBOOK_SCHEMA_VERSION}`],
];

const nextSlices = [
  {
    title: "Static Player Reuse",
    body: "Carry forward the current HTML player concept, question behavior, and JSON schema discipline.",
  },
  {
    title: "Lesson 3.2 Runtime",
    body: "Import and render Relationships and Cardinality as the first complete vertical slice.",
  },
  {
    title: "Canvas Embedded LTI",
    body: "Launch the workbook inside Canvas and pass grades back through LTI Advantage.",
  },
];

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-card">
          <p className="eyebrow">Learn Database Workbook Platform</p>
          <h1>Database learning, built as an interactive workbook.</h1>
          <p className="lede">
            This scaffold is the foundation for the Canvas-embedded, self-guided
            course platform. It starts with the static player ideas that already
            work and moves persistence, grading, and LMS integration into a
            backend runtime.
          </p>
        </div>

        <aside className="status-card" aria-label="Build status">
          <div>
            <span className="pill">M0 Scaffold</span>
            <h2>Foundation Check</h2>
            <ul className="status-list">
              {foundationItems.map(([label, value]) => (
                <li key={label}>
                  <strong>{label}</strong>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
          <p>
            First target: a runnable monorepo with local SQLite development and
            production-ready PostgreSQL direction.
          </p>
        </aside>
      </section>

      <section className="grid" aria-label="Next build slices">
        {nextSlices.map((slice) => (
          <article className="tile" key={slice.title}>
            <h3>{slice.title}</h3>
            <p>{slice.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
