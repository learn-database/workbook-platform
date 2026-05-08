# Content Development And Import Contract

Status: draft
Contract version: 0.1.0
Runtime schema target: `@learn-database/workbook-schema` `0.2.0`

This contract defines how course content is authored, validated, imported, and rendered in the workbook player. The goal is to support both reading material and knowledge-check exercises without forcing content authors to write database records or React-specific markup.

## Source Of Truth

Content authors work in the `learn-database/course-materials` repository. The workbook platform imports from that repository into the platform database.

The authoring source is lesson-folder Markdown plus an `import.yml` map. The importer reads student-facing lesson content from `lesson.md`, reads player sequencing from `import.yml`, converts the result into a typed `WorkbookLesson`, validates it against `@learn-database/workbook-schema`, and writes a new draft `CourseVersion` into the database.

Do not author directly in the platform database except for local testing. The database is a published/imported runtime form, not the long-term content source.

## File Structure

Recommended source layout:

```text
textbook/
  v4/
    cases/
      lakeside-tutoring-center-primary-case.md
      lakeside-clinic-alternative-case.md
    modules/
      module-03-core-data-modeling/
        module.md
        lessons/
          lesson-03-02-relationships-and-cardinality/
            lesson.md
            instructor.md
            authoring-instructions.md
            import.yml
          lesson-03-03-attributes-and-identifiers/
            lesson.md
            instructor.md
            authoring-instructions.md
            import.yml
```

Required conventions:

- Course-level metadata is defined by the v4 course design files until a formal `course.yml` exists.
- Each module folder contains `module.md` for module-level overview and planning.
- Each lesson folder contains `lesson.md`, `instructor.md`, `authoring-instructions.md`, and `import.yml`.
- `lesson.md` is the student-facing source. Do not duplicate normal student content in `instructor.md`.
- `import.yml` is the player contract. It maps lesson headings into connected player segments and interactions.
- Cases are reusable Markdown files so a lesson can reference the same case without duplicating full case text.
- Lesson folder names use two-digit module and lesson numbers: `lesson-03-02-relationships-and-cardinality`.
- Stable IDs are lowercase kebab-case. They must not change after a lesson is imported unless the learning object is intentionally replaced.

## Course Metadata

Current source:

- `textbook/v4/00-course-design-spec.md`
- `textbook/v4/01-module-sequence.md`
- `textbook/v4/05-lesson-writing-agent-index.md`

Future normalized metadata may move into `textbook/v4/course.yml`:

```yaml
course:
  id: learn-database
  slug: learn-database
  title: Learn Database
  description: Interactive workbook course for database management.

courseVersion:
  versionLabel: v4-draft
  schemaVersion: 0.2.0
  sourceRepo: learn-database/course-materials
```

## Module Metadata

Current source:

- `textbook/v4/modules/module-03-core-data-modeling/module.md`
- `textbook/v4/modules/module-03-core-data-modeling/lessons/*/import.yml`

Future normalized metadata may move into `module.yml` inside each module folder:

```yaml
id: module-3-core-data-modeling
number: 3
slug: core-data-modeling
title: Core Data Modeling
overview: >
  Module 3 builds conceptual modeling skill focused on entities, attributes,
  relationships, cardinality, optionality, critique, and defense.
lessons:
  - lesson-03-02-relationships-and-cardinality
```

## Lesson Folder Format

Each lesson folder separates student content, instructor notes, authoring guidance, and the import map.

```text
lesson-03-02-relationships-and-cardinality/
  lesson.md
  instructor.md
  authoring-instructions.md
  import.yml
```

`lesson.md` uses normal Markdown headings. The current importer resolves top-level `##` headings and nested `###` headings through `import.yml` section paths.

```yaml
contractVersion: 0.1.0
lessonId: module-3.lesson-3.2.relationships-and-cardinality
source: lesson.md
title: Relationships and Cardinality
playerMode: segmented
defaultCaseRef: lakeside-tutoring-center

segments:
  - id: relationship-patterns
    title: Relationship Patterns
    type: read_try
    purpose: Compare 1:N, N:M, recursive hierarchy, and recursive network patterns.
    sections:
      - "Core Content > 3. One-to-many and many-to-many do not mean the same thing"
      - "Examples and Case > Example 2: Student and Course"
    interactions:
      - id: practice-1-classify-the-pattern
        source: "Guided Practice > Practice 1: Classify the pattern"
        kind: written_response_interaction
        scoringMode: self_graded
        points: 1
        placement: after_sections
```

The importer must preserve the order of `segments` and the order of each segment's `interactions`. That order becomes `sortOrder` in the database and the player.

For deterministic or prompt-graded exercises, add answer keys, rubrics, and grading prompts to the interaction metadata once the importer supports those fields generically. Until then, lesson-specific import adapters may supply the scoring details from the lesson text and `import.yml`.

## Section Tags

The current mapping mechanism is `import.yml`, not inline Markdown directives. Future authoring may add inline tags for finer-grained cards, but agents should not introduce MDX-style directives until the importer supports them.

Supported `import.yml` fields:

| Field                                 | Purpose                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| `contractVersion`                     | Import contract version for validation                      |
| `lessonId`                            | Stable lesson ID                                            |
| `source`                              | Student-facing source file, currently `lesson.md`           |
| `playerMode`                          | Player sequencing mode, currently `segmented`               |
| `segments[].id`                       | Stable segment ID                                           |
| `segments[].title`                    | Player card title                                           |
| `segments[].purpose`                  | Short connector text shown at the start of the segment card |
| `segments[].sections[]`               | Markdown heading path to include in the segment card        |
| `segments[].interactions[]`           | Exercises shown immediately after the segment card          |
| `segments[].interactions.kind`        | Runtime `WorkbookInteraction.kind`                          |
| `segments[].interactions.scoringMode` | Runtime scoring mode                                        |
| `segments[].wrapUp.source`            | Optional wrap-up heading path                               |

Future inline tags should use simple author-facing names and map to runtime kinds.

| Author tag                            | Required fields                              | Runtime kind                    | Player rendering                       |
| ------------------------------------- | -------------------------------------------- | ------------------------------- | -------------------------------------- |
| `::block`                             | `id`, optional `title`                       | `content_block`                 | Reading card                           |
| `::case`                              | `id`, `ref`                                  | `case_card`                     | Case card using reusable case metadata |
| `::callout`                           | `id`, `type`, optional `title`               | `content_block` with metadata   | Reading card with visual treatment     |
| `::example`                           | `id`, optional `pattern`, optional `caseRef` | `content_block` with metadata   | Worked example card                    |
| `::check kind="choice"`               | `id`, `points`, `answer`                     | `choice_interaction`            | Radio knowledge check                  |
| `::check kind="multi-select"`         | `id`, `points`, `answers`                    | `multi_select_interaction`      | Checkbox knowledge check               |
| `::check kind="short-answer"`         | `id`, `points`, scoring config               | `short_answer_interaction`      | Short text response                    |
| `::check kind="written-response"`     | `id`, `points`, scoring config               | `written_response_interaction`  | Long response                          |
| `::check kind="design-judgment"`      | `id`, `points`, grading prompt               | `design_judgment`               | Design critique response               |
| `::check kind="relationship-pattern"` | `id`, `points`, patterns                     | `relationship_pattern_activity` | Pattern labeling activity              |
| `::check kind="checklist"`            | `id`, `points`, criteria                     | `checklist_interaction`         | Self-check checklist                   |
| `::checkpoint`                        | `id`, `deliverable`, criteria                | `project_checkpoint`            | Project checkpoint card                |
| `::sql`                               | `id`, `databaseRef`, scoring config          | `sql_interaction`               | SQL response card                      |

Importer rule: unsupported `import.yml` kinds or future inline tags fail validation. Unknown fields are allowed only under a `metadata` object so the runtime contract does not drift silently.

## Card And Block Mapping

The importer classifies every tagged section into one of two database tables:

- Reading material goes to `ContentBlock`.
- Exercises go to `Interaction`.

Mapping rules:

- Segment cards, `content_block`, `case_card`, callouts, and examples are reading cards.
- Knowledge checks, written exercises, SQL tasks, pattern activities, and checkpoints are interactions.
- `caseRef` links a card or interaction to a reusable case.
- `import.yml` segment order controls the player order, regardless of whether the item is stored as a `ContentBlock` or an `Interaction`.
- The player should not infer learning intent from display title. It should use `kind`, `metadata.tags`, and `scoring.mode`.

Recommended metadata fields:

```yaml
metadata:
  tags:
    - reading
    - relationships
    - lakeside
  pattern: "N:M"
  aiUse: "allowed-for-feedback"
  biblicalIntegration: "stewardship"
```

## Knowledge Check Contract

Every exercise must declare scoring behavior.

Supported scoring modes:

- `automatic`: the platform can score deterministically from `answerKey`.
- `self_graded`: the player shows criteria and asks the student to verify their work.
- `grading_prompt`: the platform or an AI grader can evaluate a response using a stored grading prompt and rubric.

Minimum exercise fields:

```yaml
id: classify-volunteer-event
kind: choice
points: 1
scoring:
  mode: automatic
  answerKey: many-to-many
  rubric:
    - Chooses many-to-many because both sides can relate to many instances.
```

Rules:

- `automatic` requires `answerKey`.
- `grading_prompt` requires `gradingPrompt` and a rubric.
- `self_graded` requires a rubric or self-check criteria.
- Every exercise with points must be renderable without instructor intervention.
- Explanations, hints, and feedback are optional but recommended.

## Reading Material Contract

Reading cards should be concise enough to render inside the player without duplicating textbook-scale chapters.

Recommended reading block fields:

```markdown
::block{id="relationship-rules" title="Relationship Rules" tags="reading,modeling"}
Write relationship rules in plain language before drawing lines.
::
```

Rules:

- One block should teach one idea.
- Long textbook sections should be split into several blocks.
- If a block prepares students for a knowledge check, place the check immediately after the block.
- Case-specific reading should include `caseRef`.
- Instructor-only notes do not belong in the student-facing lesson file. Put them in a separate instructor file if needed.

## Reusable Case Contract

Cases live outside lessons and are referenced by stable ID.

Example case file:

```yaml
id: lakeside-tutoring-center
title: Lakeside Tutoring Center
summary: >
  Primary course case for modeling tutoring sessions, students, tutors,
  subjects, and later user-role redesign decisions.
primaryUse: primary
tables:
  - Student
  - Tutor
  - TutoringSession
  - Subject
  - SessionSubject
relationshipPatterns:
  - "1:N"
  - "N:M"
  - "recursive hierarchy"
```

Rules:

- Lessons reference cases by `caseRefs` in frontmatter and `caseRef` or `ref` in tags.
- Broken case references fail import.
- The importer stores the case once per course version and links lesson cards/interactions to that imported case row.

## Import Pipeline

The importer should perform these steps:

1. Read course and module metadata from the v4 source files.
2. Read each selected lesson folder in module order.
3. Read `lesson.md` and `import.yml`.
4. Resolve `import.yml` section paths against `lesson.md` headings.
5. Resolve case references from `textbook/v4/cases/*.md`.
6. Convert segments and interactions to `WorkbookLesson.interactions`.
7. Validate with `validateWorkbookPackage`.
8. Insert a new draft `CourseVersion`.
9. Store reading cards in `ContentBlock` and exercises in `Interaction`.
10. Store source paths and import metadata for traceability.
11. Write a `PublishRun` log containing source files, warnings, and import summary.

Import must be append-only at the course-version level. Re-importing the same source creates a new draft version label such as `v4-draft-2`, not a destructive overwrite.

## Validation Rules

Hard failures:

- Missing course, module, or lesson required metadata.
- Duplicate stable IDs within a package.
- Missing `schemaVersion` or schema mismatch.
- Unsupported `import.yml` field, runtime kind, or future author tag.
- Broken `caseRef`.
- Broken section path in `import.yml`.
- Exercise missing prompt.
- Exercise missing scoring configuration.
- `automatic` exercise missing answer key.
- `grading_prompt` exercise missing grading prompt.

Warnings:

- Reading block exceeds recommended length.
- Exercise has no hint or feedback.
- Lesson has reading material but no knowledge checks.
- Lesson has knowledge checks but no reading block before the first check.
- Lesson has no case connection when the module expects case-based practice.
- Metadata contains tags not listed in the controlled vocabulary.

## Controlled Tags

Initial tag vocabulary:

- `reading`
- `case`
- `knowledge-check`
- `self-check`
- `project-checkpoint`
- `sql`
- `relationship-pattern`
- `normalization`
- `denormalization`
- `data-warehouse`
- `lakeside`
- `clinic`
- `biblical-integration`
- `stewardship`
- `justice`
- `truthfulness`
- `service`

The controlled vocabulary should live in code once the importer supports Markdown parsing. Until then, this section is the source of truth.

## AI Agent Authoring Rules

AI drafting agents must follow this contract.

- Generate Markdown lesson files, not database seed files.
- Preserve stable IDs from the lesson plan.
- Use `lesson.md` for student-facing content and `import.yml` for player sequencing.
- Use only supported runtime kinds and controlled tags.
- Put reading material and knowledge checks in the intended player order through `import.yml`.
- Do not include secrets, real student data, API keys, access tokens, or private LMS details.
- Do not create instructor-facing content inside student lesson files unless a field explicitly supports it.
- Include grading prompts only where the scoring mode is `grading_prompt`.
- Prefer case-based prompts that require judgment, explanation, or application rather than generic recall.

## Open Decisions

These should be resolved before building the general Markdown importer:

- Whether future inline authoring should use MDX-style directives, fenced YAML blocks, or remain plain Markdown plus `import.yml`.
- Whether `metadata.tags` should be stored as JSON text in current tables or normalized into a future `Tag` table.
- Whether SQL exercises should reference a shared database fixture by stable ID or embed starter schema snippets in lesson metadata.
