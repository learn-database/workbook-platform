# GitHub Project, Milestones, And Issues Plan

## Project Setup

Create one organization-level GitHub Project under `learn-database`.

Recommended project name:

```text
Learn Database Platform MVP
```

Project purpose:

```text
Track the first production-capable workbook platform MVP, from scaffold to one complete Canvas-embedded, grade-integrated Lesson 3.2 vertical slice.
```

Primary repository:

```text
learn-database/workbook-platform
```

Supporting repository:

```text
learn-database/course-materials
```

Use the project for cross-repo coordination, but keep most implementation issues in `workbook-platform`. Create `course-materials` issues only when the work changes authored course content, workbook source, lesson packages, cases, or assessment/activity content.

## Project Fields

Recommended project fields:

```text
Status
  Backlog
  Ready
  In Progress
  In Review
  Blocked
  Done

Milestone
  M0 Project Scaffold
  M1 Content Import And Schema
  M2 Standalone Lesson Runtime
  M3 Canvas Embedded LTI
  M4 Grade Passback
  M5 SQL Interaction MVP
  M6 Module Coverage
  M7 Operational Readiness

Workstream
  frontend
  backend
  database
  content
  lti
  grading
  devops
  docs
  qa

Priority
  P0 Critical
  P1 High
  P2 Normal
  P3 Later

Size
  S
  M
  L
  XL
```

Recommended views:

- Roadmap by milestone.
- Board by status.
- Table grouped by workstream.
- Current MVP view filtered to M0-M4.
- Blocked items view.

## Labels

Create these labels in `workbook-platform`:

```text
type: feature
type: bug
type: docs
type: chore
type: test

area: frontend
area: backend
area: database
area: content-import
area: schema
area: lti
area: canvas
area: grading
area: sql
area: ci
area: security
area: docs

priority: p0
priority: p1
priority: p2
priority: p3

milestone: m0-scaffold
milestone: m1-content-import
milestone: m2-runtime
milestone: m3-lti
milestone: m4-grade-passback
milestone: m5-sql
milestone: m6-content-scale
milestone: m7-ops
```

Create these labels in `course-materials`:

```text
type: content
type: docs
type: validation

area: lesson-package
area: workbook-source
area: case
area: assessment
area: activity

priority: p0
priority: p1
priority: p2
priority: p3
```

## Milestones

GitHub milestones are repository-scoped. Create these milestones in `workbook-platform`.

### M0 Project Scaffold

Outcome:

```text
Runnable monorepo foundation with web app, API app, shared packages, database setup, placeholder env files, and CI.
```

Exit criteria:

- `apps/web` runs locally.
- `apps/api` runs locally.
- SQLite runs as the default local development database.
- PostgreSQL production/staging parity setup is documented.
- Root lint, typecheck, test, and build scripts exist.
- CI runs on pull requests.
- `.env.example` contains placeholders only.

### M1 Content Import And Schema

Outcome:

```text
Versioned workbook content can be validated and imported into the database.
```

Exit criteria:

- Prisma MVP schema and migrations exist.
- Existing static JSON schemas are represented in `packages/workbook-schema`.
- Static player samples are used as validation fixtures.
- Lesson 3.2 can be imported as a draft course version.
- At least one legacy static lesson JSON file validates or produces clear migration errors.

### M2 Standalone Lesson Runtime

Outcome:

```text
Lesson 3.2 renders and runs in standalone preview mode with response persistence and scoring.
```

Exit criteria:

- The React lesson player preserves the static player UI concept.
- Lesson content, case cards, choice, multi-select, short answer, written response, checklist, and design judgment blocks render.
- Attempts can be created, saved, resumed, and submitted.
- Automatic and self-graded scoring work.
- Self-grading prompt reveals are audited.

### M3 Canvas Embedded LTI

Outcome:

```text
Lesson 3.2 launches inside Canvas through embedded LTI 1.3.
```

Exit criteria:

- OIDC login initiation works.
- LTI launch JWT validation works.
- Canvas platform, deployment, context, user, role, launch, and line item data are stored.
- Canvas assignment or module item opens the lesson inside Canvas iframe.
- Standalone preview continues to work.

### M4 Grade Passback

Outcome:

```text
Completed Lesson 3.2 attempts pass grades back to Canvas.
```

Exit criteria:

- Final grade results are calculated and stored.
- Canvas AGS score passback works for the correct line item.
- Passback success and failure logs are stored.
- Failed passback can be retried safely.

### M5 SQL Interaction MVP

Outcome:

```text
SQL interactions run through the backend instead of direct frontend SQL service calls.
```

Exit criteria:

- Backend SQL proxy or MVP SQL executor exists.
- Unsafe SQL requests are blocked.
- SQL responses, result metadata, feedback, and scores are stored.
- Frontend never calls the SQL execution service directly.

### M6 Module Coverage

Outcome:

```text
At least one full module runs in standalone and Canvas-embedded modes.
```

Exit criteria:

- Remaining Module 3 lessons are converted and imported.
- Module 4 lessons are started or imported, including normalization and denormalization examples.
- Relationship-pattern interactions support `1:N`, `M:N`, recursive hierarchy, recursive network, and item-line patterns.
- Every graded interaction is automatic or self-graded.

### M7 Operational Readiness

Outcome:

```text
The platform is ready for controlled course pilot use.
```

Exit criteria:

- Deployment documentation exists.
- Production configuration checklist exists.
- Monitoring plan exists for API, LTI, grade passback, and SQL failures.
- Backup and restore procedure exists.
- Privacy and data-retention documentation exists.

## Initial Issues

Create these issues first in `learn-database/workbook-platform`.

### Issue 1: Scaffold Monorepo Foundation

Milestone: M0 Project Scaffold

Labels:

```text
type: feature
area: ci
priority: p0
milestone: m0-scaffold
```

Body:

```text
Create the initial monorepo foundation for the workbook platform.

Tasks:
- Choose and initialize the workspace package manager.
- Add root scripts for dev, build, lint, typecheck, test, and format.
- Create apps/web for the Next.js frontend.
- Create apps/api for the NestJS backend.
- Create packages/workbook-schema, packages/db, and packages/lti.
- Add baseline TypeScript configuration.
- Add README instructions for local development.

Acceptance criteria:
- A developer can install dependencies and run root scripts.
- The web and API apps can start locally.
- Shared packages can be imported by the apps.
- No secrets or real deployment values are committed.
```

### Issue 2: Add SQLite Local Development Database Setup

Milestone: M0 Project Scaffold

Labels:

```text
type: chore
area: database
priority: p0
milestone: m0-scaffold
```

Body:

```text
Add simple local database setup for development.

Tasks:
- Add SQLite as the default local development database.
- Add .env.example with placeholder values only.
- Add database migration, reset, and seed instructions.
- Document optional PostgreSQL setup for staging/production parity checks.
- Add a health-check or simple verification command.

Acceptance criteria:
- SQLite works locally without requiring PostgreSQL.
- PostgreSQL parity setup is documented but not required for routine local development.
- .env.example contains placeholders only.
- No .env file or credential is committed.
```

### Issue 3: Add CI For Lint, Typecheck, Test, And Build

Milestone: M0 Project Scaffold

Labels:

```text
type: chore
area: ci
priority: p1
milestone: m0-scaffold
```

Body:

```text
Add baseline GitHub Actions CI.

Tasks:
- Run install, lint, typecheck, tests, and build on pull requests.
- Cache dependencies if appropriate.
- Keep CI free of secrets.

Acceptance criteria:
- CI runs on pull requests.
- CI passes on the scaffolded codebase.
- No secret values are required for baseline CI.
```

### Issue 4: Inventory Static Player Assets For Migration

Milestone: M1 Content Import And Schema

Labels:

```text
type: docs
area: content-import
area: schema
priority: p0
milestone: m1-content-import
```

Body:

```text
Inventory the reusable static HTML player assets from dbm-materials/src.

Tasks:
- List reusable UI assets from custom.css and HTML shells.
- List reusable question renderer behavior from src/lib/js.
- List legacy lesson JSON files to use as migration fixtures.
- List JSON schemas and schema sample files.
- Identify SQL schema display assets.
- Identify what must not be reused directly, including browser-only persistence, direct SQL calls, and SCORM-style hooks.

Acceptance criteria:
- A migration inventory document exists.
- Reuse candidates and non-reuse boundaries are explicit.
- The inventory references public-safe files only.
```

### Issue 5: Implement Prisma MVP Schema And Migrations

Milestone: M1 Content Import And Schema

Labels:

```text
type: feature
area: database
priority: p0
milestone: m1-content-import
```

Body:

```text
Implement the MVP database schema using Prisma.

Tasks:
- Add models for Course, CourseVersion, Module, Lesson, ContentBlock, Interaction, InteractionOption, Case, Rubric.
- Add models for User, Enrollment, Launch, Attempt, Response, GradeResult, GradePassbackLog.
- Add models for LtiPlatform, LtiDeployment, LtiRegistration, and LtiLineItem.
- Add PublishRun and AuditEvent if needed for MVP traceability.
- Generate and test initial migrations.

Acceptance criteria:
- Migrations run against local SQLite.
- Production/staging parity checks run against PostgreSQL before release.
- The schema supports versioned content and attempt locking.
- The schema supports future Canvas launch and grade passback data.
```

### Issue 6: Define Workbook JSON Schema Package From Static Player Schemas

Milestone: M1 Content Import And Schema

Labels:

```text
type: feature
area: schema
area: content-import
priority: p0
milestone: m1-content-import
```

Body:

```text
Create packages/workbook-schema using the existing static player schemas as the starting point.

Tasks:
- Convert or adapt legacy lesson and question schemas into TypeScript types and JSON schema.
- Include legacy support for text block, choice, multi-select, essay, SQL, SQL choice, SQL short answer, short answer, self-check, matching, and matrix interactions.
- Add v4 extensions for case cards, design judgments, self-grading prompts, relationship-pattern activities, and project checkpoints.
- Add validation tests using schema sample JSON files from the static player.

Acceptance criteria:
- Static player sample JSON validates or produces clear compatibility errors.
- v4-specific block types are represented.
- Every graded interaction requires automatic or self-graded scoring configuration.
```

### Issue 7: Build Content Validator And Lesson 3.2 Import Script

Milestone: M1 Content Import And Schema

Labels:

```text
type: feature
area: content-import
area: backend
priority: p0
milestone: m1-content-import
```

Body:

```text
Build the first content validation and import workflow.

Tasks:
- Validate a workbook package before import.
- Import Lesson 3.2 into the database as a draft CourseVersion.
- Preserve stable IDs for course, module, lesson, block, and interaction records.
- Report validation errors for missing prompts, missing scoring settings, broken case references, and duplicate IDs.
- Add a legacy import test for one selected static lesson JSON file.

Acceptance criteria:
- Lesson 3.2 imports into local SQLite.
- The import path can be validated against PostgreSQL for production parity.
- Reimporting changed content creates a new version.
- Invalid content fails before writing partial data.
```

### Issue 8: Build Standalone Lesson Renderer For Lesson 3.2

Milestone: M2 Standalone Lesson Runtime

Labels:

```text
type: feature
area: frontend
priority: p0
milestone: m2-runtime
```

Body:

```text
Build the first React lesson player for Lesson 3.2.

Tasks:
- Render lesson title, purpose, content blocks, case cards, and interactions.
- Preserve the familiar static player UI concept and flow.
- Add responsive layout for standalone and future Canvas iframe use.
- Render choice, multi-select, short answer, written response, checklist, and design judgment blocks.
- Add local loading, error, and empty states.

Acceptance criteria:
- Lesson 3.2 renders in standalone preview mode.
- The UI visibly carries forward the current static player concept.
- The renderer is componentized enough to support additional lessons.
```

### Issue 9: Implement Attempts, Response Save, Resume, And Submit

Milestone: M2 Standalone Lesson Runtime

Labels:

```text
type: feature
area: backend
area: frontend
priority: p0
milestone: m2-runtime
```

Body:

```text
Implement attempt lifecycle support.

Tasks:
- Create attempts for a lesson and user/session.
- Save responses incrementally.
- Resume an existing in-progress attempt.
- Submit an attempt.
- Attach attempts to exact course and lesson versions.

Acceptance criteria:
- Refreshing the lesson resumes the same attempt.
- Submitted attempts cannot be accidentally rewritten as new content versions are imported.
- Response save and submit behavior is covered by tests.
```

### Issue 10: Implement Automatic And Self-Graded Scoring

Milestone: M2 Standalone Lesson Runtime

Labels:

```text
type: feature
area: grading
priority: p0
milestone: m2-runtime
```

Body:

```text
Implement MVP scoring for automatic and self-graded interactions.

Tasks:
- Score choice, multi-select, checklist, and simple short-answer interactions.
- Display student-facing self-grading prompts for written/design judgment interactions.
- Store student-confirmed self-scores.
- Audit grading prompt and solution reveals.
- Calculate current attempt score.

Acceptance criteria:
- Every graded interaction is either automatic or self-graded.
- Self-grading prompts are required and audited.
- Attempt score updates after response save or self-grade submission.
```

### Issue 11: Implement Canvas Embedded LTI Launch

Milestone: M3 Canvas Embedded LTI

Labels:

```text
type: feature
area: lti
area: canvas
area: backend
priority: p0
milestone: m3-lti
```

Body:

```text
Implement LTI 1.3 launch so Canvas opens Lesson 3.2 inside Canvas.

Tasks:
- Implement OIDC login initiation.
- Validate LTI launch JWTs.
- Store platform, deployment, context, user, role, launch, and line item data.
- Map Canvas launch targets to Lesson 3.2.
- Create an embedded lesson session after launch.
- Add iframe-safe headers and layout behavior.

Acceptance criteria:
- A Canvas assignment or module item opens Lesson 3.2 inside Canvas iframe.
- The backend validates launch claims before creating a session.
- Standalone preview still works.
- No real Canvas secrets or launch payloads are committed.
```

### Issue 12: Implement Canvas AGS Grade Passback

Milestone: M4 Grade Passback

Labels:

```text
type: feature
area: grading
area: canvas
area: lti
priority: p0
milestone: m4-grade-passback
```

Body:

```text
Pass completed Lesson 3.2 scores back to Canvas.

Tasks:
- Calculate final GradeResult on attempt submission.
- Send score to Canvas through LTI Assignment and Grade Services.
- Store passback success and failure logs.
- Add retry support for failed passback.
- Add basic admin/instructor troubleshooting view or endpoint.

Acceptance criteria:
- Canvas receives the correct score for the correct line item.
- Passback responses are logged.
- Failed passback can be retried safely.
```

## Course-Materials Issues

Create these issues in `learn-database/course-materials` only if the workbook package source does not already exist.

### Course Issue 1: Create Workbook Package Source For Lesson 3.2

Labels:

```text
type: content
area: workbook-source
priority: p0
```

Body:

```text
Create the workbook-package-ready source for Lesson 3.2 Relationships and Cardinality.

Acceptance criteria:
- Content aligns with the existing v4 draft.
- Lakeside is the primary case.
- Cedar Valley Clinic is optional or supplemental.
- Every interaction is automatic or self-graded.
- Self-graded interactions include student-facing grading prompts.
```

### Course Issue 2: Add Content Validation Fixtures For Lesson 3.2

Labels:

```text
type: validation
area: lesson-package
priority: p1
```

Body:

```text
Add public-safe validation fixtures for the Lesson 3.2 workbook package.

Acceptance criteria:
- Fixtures contain no real student data or secrets.
- Fixtures cover valid package structure.
- Fixtures cover at least one invalid missing-prompt case.
```

## Creation Order

Use this order:

1. Create labels in `workbook-platform`.
2. Create milestones in `workbook-platform`.
3. Create the org-level GitHub Project.
4. Create the first 12 `workbook-platform` issues.
5. Add issues to the GitHub Project.
6. Assign milestones, labels, status, workstream, priority, and size.
7. Create the two `course-materials` issues only if needed.
8. Add course-material issues to the same org-level project.

## Suggested Initial Project Status

Set statuses like this:

```text
Ready
  Issue 1
  Issue 2
  Issue 3
  Issue 4

Backlog
  Issue 5
  Issue 6
  Issue 7
  Issue 8
  Issue 9
  Issue 10
  Issue 11
  Issue 12
```

Do not start Canvas or grade passback implementation until the scaffold, database, schema, and Lesson 3.2 import path are working.
