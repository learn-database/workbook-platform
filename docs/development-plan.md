# Workbook Platform Development Plan

## Goal

Build the first production-capable version of the Learn Database workbook platform around one complete vertical slice before scaling to the full course.

The first slice should prove that the platform can:

- import one lesson from `course-materials`
- store versioned lesson content in the runtime database
- render the lesson in standalone preview mode
- render the same lesson inside Canvas through embedded LTI 1.3 launch
- save student interaction responses
- score automatic and self-graded interactions
- pass a grade back to Canvas through LTI Assignment and Grade Services

The recommended first slice remains:

```text
Lesson 3.2 Relationships and Cardinality
```

## Development Principles

- Build the runtime before building authoring UI. `course-materials` stays the authoring source of truth.
- Keep Canvas embedded delivery as the primary LMS experience.
- Keep standalone mode for preview, testing, public demos, and non-LMS learners.
- Treat every interaction as automatic or self-graded. Do not build ordinary manual grading as a dependency.
- Store attempts against exact content versions. Never rewrite historical attempt context when content changes.
- Keep secrets, student data, Canvas payloads, private keys, and production logs out of the public repo.
- Prefer a small working vertical slice over broad partial scaffolding.
- Reuse the current static HTML player as the UI and schema reference. Port its strongest ideas before redesigning them.

## Static Player Reuse

The current static project in `dbm-materials/src` should guide the first implementation. The goal is not to keep a separate static app forever; the goal is to carry forward the parts that already work well.

Reuse targets:

- UI direction from `src/lib/custom.css`, `lesson.html`, `index.html`, and the Seek Your Challenge pages.
- Interaction concepts from the existing question renderer files in `src/lib/js/`.
- Lesson structure from `src/lib/lessons/*.json`.
- Robust legacy schemas from `src/lesson json schemas/*.schema.json`.
- Schema samples from `src/lesson json schemas/samples/*.sample.json` as validation fixtures.
- SQL/database display assets from `src/lib/schemas/*.json`.
- Prism/code-input behavior for SQL presentation and editing, after package/license review.

Migration boundaries:

- Keep the visual and interaction model familiar.
- Move persistence to the backend.
- Move SQL execution behind the backend.
- Move grading authority to backend services.
- Replace SCORM-style LMS hooks with LTI 1.3 and Canvas AGS.
- Extend, rather than discard, the JSON schema model for v4 case cards, self-grading prompts, relationship-pattern activities, and project checkpoints.

## Phase 0: Project Scaffold

Purpose: create a runnable monorepo foundation.

Work packages:

- Initialize the workspace package manager and root scripts.
- Create `apps/web` with Next.js.
- Create `apps/api` with NestJS.
- Create `packages/workbook-schema` for shared content and interaction types.
- Create `packages/db` for Prisma schema and database client.
- Create `packages/lti` for LTI 1.3 helper code.
- Add SQLite as the default local development database.
- Add optional PostgreSQL setup for staging/production parity checks.
- Add `.env.example` files with placeholders only.
- Add lint, typecheck, test, and format scripts.
- Add CI that runs install, lint, typecheck, and tests.
- Add a documented local path or fixture-copy process for referencing the current static player during migration.

Acceptance criteria:

- A developer can clone the repo, copy `.env.example`, run SQLite migrations, and start both apps locally without installing PostgreSQL.
- PostgreSQL setup is documented for production/staging parity checks.
- CI passes on a clean pull request.
- No secrets or real Canvas values are committed.
- The repo documents how the static player assets and schemas are used as migration references.

## Phase 1: Data Model And Content Import

Purpose: make course content database-backed and versioned.

Work packages:

- Implement Prisma models for content, identity, launches, attempts, responses, grading, LTI, publishing, and audit logs.
- Implement migrations for the MVP subset of the schema.
- Keep the Prisma schema compatible with SQLite for local development and PostgreSQL for production.
- Define the workbook package JSON contract in `packages/workbook-schema`, starting from the existing static player JSON schemas.
- Add compatibility tests using the current schema sample JSON files.
- Create a content validation script.
- Create an import script that reads a built lesson package and creates a draft `CourseVersion`.
- Create a legacy import path for selected `src/lib/lessons/*.json` files.
- Seed Lesson 3.2 as the first imported lesson.
- Add version locking so attempts reference the exact imported lesson version.

Acceptance criteria:

- Lesson 3.2 can be imported into a local database.
- The same content import path works against local SQLite and a PostgreSQL parity database.
- At least one existing static lesson JSON file validates or produces clear migration errors.
- Reimporting changed content creates a new version instead of mutating submitted-attempt context.
- Validation fails for missing scoring settings, missing self-grading prompts, invalid interaction IDs, and broken case references.

## Phase 2: Student Workbook Runtime

Purpose: render lessons and collect responses.

Work packages:

- Build standalone preview routes for course, module, and lesson navigation.
- Build the lesson renderer for content blocks, case cards, choice, multi-select, short answer, written response, checklist, and design-judgment blocks.
- Port the current static player UI feel into React components before making major visual redesigns.
- Port or adapt the existing question-renderer behavior into component-level tests.
- Implement attempt creation and resume behavior.
- Implement save-as-you-go response storage.
- Implement automatic scoring for choice, multi-select, checklist, and simple short-answer interactions.
- Implement self-grading prompt display, solution/reveal audit logging, and student-confirmed self-score.
- Add basic progress and score display.

Acceptance criteria:

- A student can complete Lesson 3.2 in standalone preview mode.
- The first React lesson player visibly preserves the familiar static player concept and interaction flow.
- Refreshing the browser resumes the same attempt.
- Automatic scores and self-graded scores are saved.
- Revealed grading prompts or sample answers are audited.

## Phase 3: Canvas Embedded LTI Launch

Purpose: launch the same workbook lesson inside Canvas.

Work packages:

- Implement OIDC login initiation.
- Implement LTI launch JWT validation.
- Store Canvas platform, deployment, context, user, role, launch, and line-item data.
- Map Canvas launch targets to course version and lesson.
- Create an embedded lesson session after launch.
- Add iframe-safe frontend layout and navigation.
- Add HTTP headers that allow approved Canvas domains through `Content-Security-Policy frame-ancestors`.
- Ensure embedded pages do not send `X-Frame-Options: DENY` or `SAMEORIGIN`.

Acceptance criteria:

- A Canvas assignment or module item opens Lesson 3.2 inside Canvas, not in a separate required site flow.
- The backend validates the LTI launch before creating a session.
- Student identity and role are mapped from Canvas launch claims.
- Standalone preview still works without Canvas.

## Phase 4: Grade Passback

Purpose: complete the LMS-integrated grading loop.

Work packages:

- Calculate final lesson score from automatic and self-graded interactions.
- Store `GradeResult` records.
- Send scores to Canvas through LTI Assignment and Grade Services.
- Store grade passback logs.
- Add retry behavior for failed passback.
- Add a basic instructor/admin troubleshooting page for launch and passback errors.

Acceptance criteria:

- Submitting Lesson 3.2 creates a final grade result.
- Canvas receives the score for the correct line item.
- Passback success and failure responses are logged.
- Failed passback can be retried without duplicating attempts.

## Phase 5: SQL Interaction MVP

Purpose: support database practice without exposing SQL execution directly from the browser.

Work packages:

- Add backend SQL execution proxy around the existing approved SQL endpoint or local MVP executor.
- Add request validation, rate limits, and unsafe-command blocking.
- Implement SQL interaction rendering.
- Store submitted SQL, execution result metadata, feedback, and score.
- Add expected-result comparison for simple query exercises.

Acceptance criteria:

- Students can run approved SQL exercises through the backend only.
- The frontend never calls an external SQL execution service directly.
- Unsafe or out-of-scope SQL requests are rejected and logged.

## Phase 6: Scale Content Coverage

Purpose: expand from one lesson to usable course coverage.

Work packages:

- Convert and import the remaining Module 3 lessons.
- Convert and import Module 4 lessons, including normalization and denormalization examples.
- Add relationship pattern interactions, including `1:N`, `M:N`, recursive hierarchy, recursive network, and item-line patterns.
- Add Lakeside as the primary case and Cedar Valley Clinic as the alternate discussion/resource case.
- Add lesson-level assignment/activity interactions where they can be automatically or self-graded.
- Add content validation reports for missing prompts, missing cases, broken links, and missing scoring mode.

Acceptance criteria:

- At least one full module can run end to end in standalone and Canvas-embedded modes.
- Every graded interaction has either automatic scoring or a student-facing self-grading prompt.
- Content validation produces actionable errors before publishing.

## Phase 7: Operational Hardening

Purpose: prepare for real course use.

Work packages:

- Add authentication and role handling for standalone instructor/admin views.
- Add audit logging for sensitive actions.
- Add monitoring for API errors, launch failures, passback failures, and SQL execution failures.
- Add backup and restore procedures for the database.
- Add deployment documentation.
- Add privacy and data-retention documentation.
- Add production configuration checklist.

Acceptance criteria:

- The platform can be deployed with no secrets in the repo.
- Operators can diagnose failed Canvas launches and grade passback issues.
- Student attempt data has a documented backup and retention strategy.

## First Ten Issues To Create

1. Scaffold monorepo with Next.js, NestJS, shared packages, and root scripts.
2. Add SQLite local database setup, optional PostgreSQL parity setup, and placeholder `.env.example` files.
3. Inventory static player UI, JSON schemas, sample files, and reusable interaction behavior.
4. Implement Prisma MVP schema and initial migrations.
5. Define workbook package schema from the existing static player schemas.
6. Build content validator and Lesson 3.2 import script.
7. Build standalone lesson renderer for Lesson 3.2 using the static player UI concept.
8. Implement attempt creation, response save, and resume behavior.
9. Implement automatic and self-graded scoring for MVP interactions.
10. Implement Canvas embedded LTI launch and Canvas AGS grade passback for Lesson 3.2.

## Near-Term Definition Of Done

The near-term MVP is done when:

- Lesson 3.2 is imported from content source into the database.
- A student can complete Lesson 3.2 in standalone preview mode.
- A student can launch and complete Lesson 3.2 inside Canvas.
- All graded interactions are automatic or self-graded.
- The final score is passed back to Canvas.
- The implementation includes tests for content validation, scoring, attempt persistence, LTI launch mapping, and grade passback logging.
