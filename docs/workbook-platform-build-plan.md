# Workbook Platform Build Plan

## Purpose

Build an interactive workbook platform for the Learn Database course that can run as:

- a Canvas-embedded workbook using LTI 1.3, where students view lesson content inside Canvas instead of being sent to a separate site by default
- a standalone public or private course website for preview, public delivery, or non-LMS learners
- a self-guided, grade-integrated learning tool with student attempts, automatic or self-guided scoring, and Canvas grade passback

The current static `src` folder in the original `dbm-materials` repository should be treated as a reusable prototype for interaction behavior, UI direction, and lesson JSON structure, not as disposable work. It should not remain the long-term architecture by itself, but its strongest parts should be carried forward.

Related design docs:

- [Database Schema](design/database-schema.md)
- [Sequence Diagrams](design/sequence-diagrams.md)
- [Use Cases](design/use-cases.md)

## Current Static Player Baseline

The existing static player already provides useful patterns:

```text
HTML shells
  index.html
  lesson.html
  syc01.html ... syc08.html (for testing)
  playground.html (for testing)

Runtime JavaScript
  main.js
  lesson.js
  question renderers

Lesson data
  src/lib/lessons/*.json
  encoded b*.json versions

Question types
  text block
  multiple choice
  multiple answers
  essay
  sql
  sql multiple choice
  sql short answer
  short answer
  self check
  matching
  matrix multiple answers

Support features
  schema display
  SQL execution endpoint
  score tracking
  SCORM-style LMS save hooks
```

The platform should preserve the useful interaction patterns, UI concept, and schema discipline but replace hard-coded static pages, browser-only state, duplicated lesson shells, and static JSON delivery with a database-backed application.

## Static Player Reuse Strategy

The static HTML project should be reused as the first implementation reference.

Reuse directly or adapt:

```text
src/lib/custom.css
  visual direction, spacing, lesson player feel, and interaction styling

src/lib/js/*question.js
  interaction behavior patterns and feedback concepts

src/lib/js/lesson.js
src/lib/js/question.js
src/lib/js/grade.js
  lesson rendering, question abstraction, and grading flow concepts

src/lesson json schemas/*.schema.json
  baseline schema definitions for legacy lesson/question types

src/lesson json schemas/samples/*.sample.json
  test fixtures and schema examples

src/lib/lessons/*.json
  migration fixtures and regression examples

src/lib/schemas/*.json
  database schema display assets for SQL lessons

src/lib/vendor/prism/*
  SQL/code display and editing experience, subject to package/license review
```

Do not reuse blindly:

- browser-only score persistence
- direct frontend calls to SQL execution services
- duplicated static lesson pages
- encoded lesson files as the primary distribution format
- SCORM-style hooks as the primary LMS integration strategy

Migration approach:

1. Keep a local reference copy or import path to the static player during early development.
2. Convert the existing JSON schemas into `packages/workbook-schema` as the legacy-compatible content contract.
3. Build compatibility tests using current sample JSON and selected existing lessons.
4. Port the UI patterns into React components before redesigning them.
5. Move persistence, scoring authority, SQL execution, LTI launch, and grade passback to the backend.
6. Extend the schema only where v4 needs new block types such as case cards, design judgments, self-grading prompts, and project checkpoints.

This gives the new platform continuity with the current player while still solving the architectural limitations that require a backend and Canvas grade integration.

## Target Architecture

Recommended repository structure:

```text
workbook-platform/
  apps/
    web/                 Next.js workbook frontend
    api/                 NestJS backend API

  packages/
    workbook-schema/     shared lesson, block, and interaction types
    db/                  Prisma schema and database client
    lti/                 LTI 1.3 helpers

  content-tools/
    import-course/       import published content from course-materials
    validate-content/    validate workbook packages

  infra/
    docker/
    deploy/

  docs/
```

Recommended stack:

- Frontend: Next.js and React
- Backend: NestJS
- Local development database: SQLite
- Production database: PostgreSQL
- ORM: Prisma
- Deployment: Docker plus a cloud host
- LMS integration: LTI 1.3 Advantage, especially Assignment and Grade Services

Primary delivery mode:

Canvas should be treated as the primary student-facing container for LMS sections. The workbook UI is still served by this platform, but Canvas launches should render it in an embedded LTI iframe unless an instructor explicitly chooses an external-window placement. Standalone delivery remains important for preview, testing, public demos, and non-Canvas use.

Database environment rule:

SQLite should be the default local development database because it keeps setup simple for early contributors and AI coding agents. PostgreSQL should be the production database and the staging/parity database for deployment validation. Prisma should be used carefully so the MVP schema works in SQLite locally while still validating PostgreSQL behavior before release.

## Core Data Flow

```text
course-materials repo
  v4 Markdown + future workbook source
        |
        | validate + publish
        v
workbook-platform backend
  stores versioned course content in DB
        |
        v
Next.js workbook UI
  renders lessons and interactions
        |
        v
student responses, grades, analytics
        |
        v
Canvas via LTI AGS grade passback
```

## Canvas Embedded Delivery

For Canvas-integrated sections, the expected student experience is:

```text
Student opens a Canvas module item or assignment
Canvas launches the workbook through LTI 1.3
The lesson renders inside the Canvas page iframe
The student completes interactions without leaving Canvas
The platform sends scores back to the Canvas gradebook through LTI AGS
```

Implementation requirements:

- configure Canvas placements to launch embedded by default, not "load in a new tab"
- support assignment and module-item launch contexts
- make the workbook UI responsive inside Canvas iframe widths, including narrower LMS sidebars
- preserve full standalone routing for previews and non-LMS learners
- set `Content-Security-Policy frame-ancestors` to allow the approved Canvas domains
- do not send `X-Frame-Options: DENY` or `SAMEORIGIN` on embedded workbook pages
- keep authentication, launch validation, role mapping, and grade passback on the backend

The platform should avoid depending on Canvas page scraping or Canvas-specific frontend hacks. Canvas should provide identity, course context, roles, and gradebook line items through the LTI launch and LTI Advantage services.

## Database Model

Initial content tables:

```text
Course
CourseVersion
Module
Lesson
ContentBlock
Interaction
InteractionOption
Case
Rubric
```

Initial user, attempt, and grading tables:

```text
User
Enrollment
Launch
Attempt
Response
GradeResult
GradePassbackLog
```

Initial LTI tables:

```text
LtiPlatform
LtiDeployment
LtiRegistration
LtiLineItem
```

Important versioning rule:

Student attempts must attach to the exact `CourseVersion` and `Lesson` version used at launch. Updating course content later must not rewrite the historical context of a submitted attempt.

## Content Model

The current static player question types should map into a platform-neutral workbook interaction model:

```text
text block              -> content_block
multiple choice         -> choice_interaction
multiple answers        -> multi_select_interaction
essay                   -> written_response_interaction
sql                     -> sql_interaction
sql multiple choice     -> sql_choice_interaction
sql short answer        -> sql_short_answer_interaction
short answer            -> short_answer_interaction
self check              -> checklist_interaction
matching                -> matching_interaction
matrix multiple answers -> matrix_interaction
```

Additional v4 workbook block types should be considered:

```text
case_card
design_judgment
reflection
rubric_check
revision_prompt
project_checkpoint
```

## Self-Guided Grading Model

The course should be self-guided. Every interaction should be one of these two grading modes:

```text
automatic
  The platform calculates the score from a key, expected SQL result, selected options,
  matching map, checklist completion, or exact/normalized short answer.

self_graded
  The student submits a response, compares it to a grading prompt, rubric,
  checklist, or sample answer, and records a self-score or completion judgment.
```

Manual instructor grading should not be part of the normal workflow. Instructor views may support monitoring, analytics, troubleshooting, and exceptional overrides, but the course should not depend on instructor grading to complete a lesson.

Self-graded interactions must include:

- a grading prompt or rubric written for students
- a sample answer, checklist, or comparison criteria
- a clear self-score or self-check action
- an audit record that the grading prompt or solution was shown
- grade passback based on the automatic score or student-confirmed self-grade

## Frontend Requirements

Core student screens:

```text
/course/:courseSlug
/course/:courseSlug/module/:moduleSlug
/lesson/:lessonId
/playground
```

Core instructor screens:

```text
/instructor/course/:courseId
/instructor/attempts
/instructor/lesson-performance
/instructor/grade-passback
```

Frontend features:

- module and lesson navigation
- content blocks rendered from database content
- interactive question blocks
- save-as-you-go responses
- score display
- feedback and hints
- sample solution reveal with logging
- case cards for Lakeside and Cedar Valley Clinic
- SQL playground
- Canvas-embedded lesson mode for LTI launches
- responsive layout for standalone browser use and Canvas iframe use
- iframe-safe navigation that stays inside the launched lesson context unless an external link is intentional

## Backend Requirements

Core API responsibilities:

- serve active course versions
- serve modules, lessons, blocks, and interactions
- record student launches
- create and resume attempts
- save responses
- score automatic interactions
- record self-graded interactions using structured grading prompts
- queue or execute Canvas grade passback
- provide instructor monitoring and grade-passback troubleshooting views
- expose content import and validation endpoints or scripts

The backend owns security-sensitive work. The frontend should not directly call external SQL or LTI services.

## SQL Execution Strategy

The static player currently sends SQL to an external Azure endpoint. The platform should move SQL execution behind the backend.

Options:

```text
Option A: keep the existing SQL endpoint for MVP and proxy through the backend
Option B: build a backend SQL execution service
Option C: add isolated per-student SQL sandboxes later
```

Recommendation:

- MVP: proxy the existing SQL endpoint through the backend.
- Later: add a safer sandboxed execution service with rate limits, query controls, logging, and database reset support.

## LTI 1.3 And Canvas Grade Integration

Use LTI 1.3 Advantage for Canvas integration.

Required pieces:

```text
OIDC login initiation
LTI launch validation
Canvas deployment registration
Assignment and Grade Services
launch-to-course mapping
launch-to-lesson mapping
user and role mapping
grade passback logging
```

Grade flow:

```text
Canvas assignment or module item launches workbook lesson inside Canvas
Backend validates LTI launch
Backend maps launch to course, lesson, user, and line item
Student completes workbook interactions
Student self-grades judgment interactions when required
Backend calculates score
Backend sends score to Canvas through LTI AGS
Backend logs grade passback result
```

Do not use SCORM as the long-term grade integration strategy. SCORM can remain a future compatibility export, but LTI should be the primary LMS path.

## Content Publishing From `course-materials`

The `course-materials` repository remains the source of truth for authored content.

Planned publishing process:

```text
1. Validate Markdown/workbook source.
2. Build workbook package.
3. Preview package locally.
4. Publish package to workbook-platform API or import script.
5. Create a new CourseVersion.
6. Mark the CourseVersion active after review.
```

The platform should support draft, preview, and active course versions.

## MVP Scope

The first MVP should include:

```text
Standalone login-free preview
Canvas-embedded lesson launch
Course/module/lesson navigation
Versioned lesson content in DB
Text, choice, multi-select, short answer, essay, self-check interactions
SQL question support through backend wrapper
Student attempt storage
Basic score calculation
Self-grading prompts for written/design-judgment interactions
Canvas LTI launch
Canvas grade passback for one assignment
```

Do not include in the first MVP:

```text
full browser-based authoring UI
advanced analytics
multi-institution administration
SCORM export
LTI deep linking
complex SQL sandboxing
```

## First Vertical Slice

Build one complete end-to-end lesson before scaling.

Recommended first slice:

```text
Lesson 3.2 Relationships and Cardinality
  source content from course-materials
  published into database
  rendered in workbook UI inside Canvas and standalone preview
  includes content, choice, short answer, and self-check blocks
  stores student responses
  records self-grading prompts where judgment is required
  calculates score
  passes grade back to Canvas
```

This verifies the essential architecture before converting the whole course.

## Migration From Static `src`

Migration order:

1. Inventory the current static player UI, interaction renderers, JSON schemas, sample JSON, and lesson files.
2. Copy the existing lesson/question schema ideas into `packages/workbook-schema`.
3. Write compatibility tests from `src/lesson json schemas/samples/*.sample.json`.
4. Write an importer for existing `src/lib/lessons/*.json`.
5. Import one existing lesson, likely `10 Functional Dependencies`, as a legacy fixture.
6. Rebuild the lesson renderer in React while preserving the current UI concept and interaction behavior.
7. Import the `Seek Your Challenge` lessons.
8. Add the v4 workbook lesson format as an extension of the proven schema model.
9. Pilot Module 3 or Module 4 v4 content.

## Later Enhancements

After the MVP:

- instructor dashboards
- self-grading prompt analytics
- exceptional instructor score override with audit log
- content preview workflow
- LTI Deep Linking
- richer analytics
- question-level item analysis
- cohort progress views
- safer SQL sandboxing
- optional SCORM export
- public standalone course mode with optional accounts

## Project Boundary

Use this repository for the platform.

Use `learn-database/course-materials` for authored content.

Boundary:

```text
course-materials = what the course says
workbook-platform = how the course runs
```
