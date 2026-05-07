# Static Player Migration Inventory

This inventory documents what can be reused from the existing static HTML lesson
player in `/Users/hye/Documents/GitHub/dbm-materials/src` as the workbook
platform moves to a backend-backed, Canvas-compatible, self-guided course.

The source files referenced here are public-safe course/player files only. Do
not copy credentials, real student records, Canvas launch payloads, production
connection strings, or other secrets into this repository.

## Reuse Decision

The old player is valuable as a product prototype and schema reference. Reuse
its instructional interaction model, compact lesson UI, database schema display,
question type vocabulary, and legacy JSON fixtures. Do not reuse the old
browser-only persistence, direct SQL execution calls, SCORM-style hooks, or
browser global state as authoritative platform behavior.

The target platform should preserve the simple workbook feel while moving
grading authority, attempt storage, SQL execution, LTI launch validation, and
Canvas grade passback to the backend.

## UI Shells And Layout

Reusable concepts:

- `src/lesson.html`: fixed dark lesson header, database schema strip, score
  toolbar, lesson selector, main lesson container, hint/expected-result modals,
  confirmation modal, loading overlay, and simple footer.
- `src/syc01.html` through `src/syc08.html`: challenge-style lesson pages using
  the same lesson shell with fixed lesson IDs.
- `src/index.html`: compact challenge dashboard pattern with a simple list,
  count badges, and direct lesson links.
- `src/playground.html`: SQL playground concept with schema selector, SQL editor,
  Run/Clear buttons, table result view, and raw JSON result view.
- `src/lib/custom.css`: useful layout and visual concepts, including
  `dbschema_container`, `score_container`, `playground_container`, `data_scroll`,
  `opacity-bottom`, loading overlay classes, and code/editor presentation.
- `src/lib/vendor/prism/*`: SQL syntax highlighting and `code-input` editing
  behavior are useful, pending license/package review before direct reuse.

Migration note: port these as React/Next.js components rather than copying the
HTML shells directly. The current scaffold already started this direction with a
dashboard and lesson player that echo the old fixed-header, schema-strip, and
question-card flow.

## Renderer And Interaction Behavior

Reusable behavior patterns:

- `src/lib/js/question.js`: base question contract, prompt/response/solution
  fields, feedback containers, point values, bonus marking, and question status
  styling.
- `src/lib/js/lesson.js`: lesson composition around title, overview, schema,
  question list, and summary.
- `src/lib/js/grade.js`: per-question grade state model with status, score, and
  student response tracking.
- `src/lib/js/main.js`: useful orchestration concepts such as loading a lesson,
  rendering question buttons, showing/hiding unanswered questions, restoring an
  attempt, saving progress, checking results, showing hints, showing expected
  results, and revealing keys/solutions.
- `src/lib/js/helper.js`: button status helpers, loading state helpers, result
  table rendering, SQL result beautification, and schema HTML generation.

Legacy question renderers to map into the new schema package:

| Legacy renderer    | Target interaction type                         | Migration note                                                                          |
| ------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `textblock.js`     | `content_block` or `checkpoint_acknowledgement` | Keep as instructional/self-check content, not a graded artifact by default.             |
| `mcquestion.js`    | `choice_interaction`                            | Autograded.                                                                             |
| `maquestion.js`    | `multi_select_interaction`                      | Autograded with all/partial scoring rules made explicit.                                |
| `essay.js`         | `written_response_interaction`                  | Self-graded or grading-prompt-assisted; never rely on artifact submission alone.        |
| `shortanswer.js`   | `short_answer_interaction`                      | Autograded when exact/keyed answers are appropriate; otherwise use self-grading prompt. |
| `sqlquestion.js`   | `sql_interaction`                               | Execute through backend sandbox only.                                                   |
| `sqlmcquestion.js` | `sql_choice_interaction`                        | Combine backend SQL execution with autograded choice selection.                         |
| `sqlsaquestion.js` | `sql_short_answer_interaction`                  | Combine backend SQL execution with short-answer checking.                               |
| `selfcheck.js`     | `checklist_interaction`                         | Useful for rubric-guided self-checks and reflection checkpoints.                        |
| `matching.js`      | `matching_interaction`                          | Autograded.                                                                             |
| `matrixma.js`      | `matrix_interaction`                            | Autograded matrix/multiple-answer pattern.                                              |

Migration note: the renderer classes should inform component behavior, but the
new implementation should not build HTML strings or depend on global DOM IDs for
state. React components should render from validated authored JSON and persist
attempt state through backend APIs.

## Legacy JSON Schemas

Schema files:

- `src/lesson json schemas/lesson.schema.json`
- `src/lesson json schemas/textblock.schema.json`
- `src/lesson json schemas/mcquestion.schema.json`
- `src/lesson json schemas/maquestion.schema.json`
- `src/lesson json schemas/essay.schema.json`
- `src/lesson json schemas/shortanswer.schema.json`
- `src/lesson json schemas/sqlquestion.schema.json`
- `src/lesson json schemas/sqlmcquestion.schema.json`
- `src/lesson json schemas/sqlsaquestion.schema.json`

Reusable schema ideas:

- Lesson-level content uses `id`, `title`, `overview`, `summary`, `schema`, and
  `questions`.
- Question-level content consistently uses `id`, `type`, `prompt`, `points`,
  `response`, `solution`, `hint`, `feedback`, `feedback_correct`, and
  `feedback_incorrect`.
- Choice-based interactions use `options`.
- SQL and short-answer interactions can include `enable_showkeys`.
- Several interaction types include `bonus`.

Required schema changes for the platform:

- Add explicit `scoringMode` values, such as `autograded`, `self_graded`, and
  `grading_prompt`.
- Add `gradingPrompt`, `rubric`, or `selfCheckCriteria` fields for interactions
  that cannot be evaluated safely with exact answers.
- Separate authored content from student attempt data. Legacy `response` mixes
  starter/sample/student-state meaning and should not be authoritative attempt
  storage.
- Separate `solution`, `hint`, expected output, and revealable keys into fields
  that can be audited and permissioned.
- Add content version metadata so attempts can be tied to the exact lesson
  version delivered to the student.
- Add case references so Tutor Center and Lakeside Clinic examples can be wired
  consistently across lessons.

## Sample And Lesson Fixtures

Use these as migration fixtures and compatibility tests, not as final platform
content without review:

- `src/lesson json schemas/samples/*.sample.json`: small fixture set for each
  legacy question schema.
- `src/lib/lessons/10.json`: useful early fixture because it covers functional
  dependency content.
- `src/lib/lessons/21001201.json`: current lesson shell fixture referenced by
  `src/lesson.html`.
- `src/lib/lessons/210001.json` through `src/lib/lessons/21001301.json`:
  module-style lesson fixtures.
- `src/lib/lessons/21009901.json` through `src/lib/lessons/21009908.json`:
  Seek Your Challenge fixture flow.
- `src/lib/lessons/b*.json`: encoded legacy variants. Keep only as decoder or
  backward-compatibility fixtures; do not use encoded JSON as the platform's
  authoring format.
- `src/lib/lessons/lesson_data_10.js`: legacy JavaScript-wrapped fixture; use
  only if needed for compatibility coverage.

## SQL Schema Display Assets

Reusable database schema display assets:

- `src/lib/schemas/northwind.json`
- `src/lib/schemas/wpc.json`
- `src/lib/schemas/wwi.json`

Each schema file contains `title`, `tables`, and `diagram`. This shape is a good
starting point for a platform-level database case/schema display model.

Historical SQL assets:

- `src/lib/assets/kce9grader.sql`
- `src/lib/assets/kce9solution.sql`
- `src/lib/assets/kce10grader.sql`
- `src/lib/assets/kce10solution.sql`
- `src/lib/assets/kce12solution.sql`

Migration note: review these files before reuse. They may be useful as historical
grading/solution fixtures, but student-facing solution material should be
versioned and reveal-controlled in the new content model.

## Non-Reuse Boundaries

Do not reuse these patterns directly:

- Frontend calls to `https://websqlquery.azurewebsites.net/sqlquery`. SQL
  execution must go through a backend sandbox/proxy with validation, logging,
  rate limits, and course-scoped database selection.
- Frontend calls to
  `https://coveaccelerate.azurewebsites.net/api/v1/Report/SaveState`. Attempt
  state belongs in the new backend database.
- `window.parent` SCORM driver hooks from `main.js`. Canvas integration should
  use LTI 1.3 launch validation and Assignment and Grade Services grade passback.
- Browser global variables as the source of truth for grades, responses, lesson
  state, or content version.
- Encoded `b*.json` files as a normal content delivery format.
- Browser-only local persistence as authoritative attempt storage.
- Raw HTML-string renderer output as the final implementation pattern.
- Direct vendor/CDN script copying without license review and package-managed
  dependency decisions.

## Recommended Migration Work Packages

1. Copy the legacy schemas and sample JSON into a `legacy` fixture area in
   `packages/workbook-schema`.
2. Add schema tests that validate the sample JSON and selected lesson fixtures.
3. Define the v1 authored workbook schema with explicit scoring modes, grading
   prompts, reveal controls, and content version metadata.
4. Port the lesson shell into React components: dashboard, lesson layout, schema
   strip, score toolbar, interaction card, hint modal, expected-result modal,
   and self-grade checklist.
5. Implement backend attempt storage and SQL execution before enabling real
   grading or Canvas grade passback.
6. Add import tooling that converts reviewed v4 course materials and selected
   legacy lessons into the platform schema.

## Acceptance Checklist

- Reusable UI assets from `custom.css` and HTML shells are identified.
- Reusable question renderer behavior from `src/lib/js` is identified.
- Legacy lesson JSON files are listed as migration fixtures.
- JSON schemas and schema sample files are listed.
- SQL schema display assets are identified.
- Non-reuse boundaries are explicit for browser persistence, direct SQL calls,
  direct save-state calls, SCORM hooks, and encoded/browser-global state.
