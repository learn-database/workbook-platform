# Workbook Platform Design Docs

This folder contains reviewable design documents for the Learn Database workbook platform.

## Documents

- [Database Schema](database-schema.md): proposed database entities, ERD, and table responsibilities.
- [Sequence Diagrams](sequence-diagrams.md): core runtime flows for standalone launch, LTI launch, response saving, grade passback, and content publishing.
- [Use Cases](use-cases.md): user-facing and system-facing use cases for students, instructors, content authors, administrators, and Canvas.

## Design Boundary

The platform repository is responsible for how the course runs:

```text
workbook-platform
  web delivery
  API
  database
  Canvas-embedded LTI launch
  grade passback
  attempts and analytics
```

The content repository is responsible for what the course says:

```text
course-materials
  textbook drafts
  cases
  assignments
  assessments
  workbook source
```

## Review Priorities

When reviewing these docs, focus on:

- whether the schema protects content version history
- whether Canvas grade passback has enough audit logging
- whether Canvas-embedded and standalone launches share the same workbook runtime cleanly
- whether Canvas iframe delivery constraints are explicit enough for implementation
- whether student attempts are attached to stable lesson versions
- whether all interactions can be completed through automatic grading or student self-grading prompts
- whether content publishing keeps `course-materials` as the source of truth
