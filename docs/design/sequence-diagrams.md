# Sequence Diagrams

## Standalone Lesson Launch

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant DB as PostgreSQL

    Student->>Web: Open standalone lesson URL
    Web->>API: GET active course/module/lesson
    API->>DB: Load active CourseVersion and Lesson blocks
    DB-->>API: Lesson content and interactions
    API-->>Web: Lesson payload
    Web-->>Student: Render interactive workbook lesson
```

## Canvas LTI Launch

```mermaid
sequenceDiagram
    actor Student
    participant Canvas
    participant Web as Next.js Web App
    participant API as NestJS API
    participant DB as PostgreSQL

    Student->>Canvas: Open Canvas assignment
    Canvas->>API: OIDC login initiation
    API-->>Canvas: Redirect for LTI launch
    Canvas->>API: POST LTI launch JWT
    API->>API: Validate issuer, client, nonce, signature
    API->>DB: Upsert platform, deployment, context, user, launch
    API->>DB: Resolve course version, lesson, and line item
    DB-->>API: Launch target and user context
    API-->>Web: Create session and redirect to lesson
    Web->>API: GET lesson for launch session
    API->>DB: Load versioned lesson content
    DB-->>API: Lesson payload
    API-->>Web: Lesson payload
    Web-->>Student: Render workbook inside Canvas
```

## Save Response And Automatic Score

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant Scorer as Scoring Service
    participant DB as PostgreSQL

    Student->>Web: Submit interaction response
    Web->>API: POST response
    API->>DB: Load attempt and interaction definition
    DB-->>API: Interaction, solution, scoring settings
    API->>Scorer: Score response if automatic
    Scorer-->>API: Score, status, feedback
    API->>DB: Save Response
    API->>DB: Update Attempt score and lastActivityAt
    DB-->>API: Saved response and current score
    API-->>Web: Feedback and score update
    Web-->>Student: Show feedback / unlock next block
```

## Self-Graded Interaction

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant DB as PostgreSQL

    Student->>Web: Submit written/design response
    Web->>API: POST response
    API->>DB: Save Response as saved
    API->>DB: Load GradingPrompt and sample criteria
    DB-->>API: Prompt, rubric, checklist, sample answer
    API-->>Web: Self-grading prompt payload
    Web-->>Student: Show rubric/checklist/sample answer
    Student->>Web: Record self-score or self-check
    Web->>API: POST self-grade
    API->>DB: Save selfGradeJson and score
    API->>DB: Update Attempt score and audit prompt reveal
    API-->>Web: Current score and feedback
```

## SQL Interaction Through Backend Proxy

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant SQL as SQL Execution Service
    participant DB as PostgreSQL

    Student->>Web: Submit SQL query
    Web->>API: POST SQL response
    API->>DB: Load SQL interaction and expected result
    API->>API: Validate request, rate limit, strip unsafe settings
    API->>SQL: Execute query against approved sample database
    SQL-->>API: Result set or error
    API->>API: Compare result to expected output
    API->>DB: Save response, result metadata, score
    API-->>Web: Query result, feedback, score
    Web-->>Student: Show result table and feedback
```

## Canvas Grade Passback

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant DB as PostgreSQL
    participant Canvas as Canvas AGS

    Student->>Web: Submit final lesson attempt
    Web->>API: POST submit attempt
    API->>DB: Load attempt, responses, line item
    API->>API: Calculate final GradeResult
    API->>DB: Save GradeResult
    API->>Canvas: POST score to line item
    Canvas-->>API: Grade passback response
    API->>DB: Save GradePassbackLog
    API-->>Web: Submission confirmation
    Web-->>Student: Show submitted status and score
```

## Instructor Monitoring And Exceptional Override

```mermaid
sequenceDiagram
    actor Instructor
    participant Web as Instructor UI
    participant API as NestJS API
    participant DB as PostgreSQL
    participant Canvas as Canvas AGS

    Instructor->>Web: Open attempt analytics or passback failures
    Web->>API: GET attempts and grade status
    API->>DB: Load attempts, self-grades, and passback logs
    DB-->>API: Monitoring data
    API-->>Web: Attempts dashboard
    Instructor->>Web: Request exceptional score override if needed
    Web->>API: POST override with reason
    API->>DB: Save audited ScoreEvent and updated GradeResult
    API->>Canvas: POST updated score if LTI line item exists
    Canvas-->>API: Passback response
    API->>DB: Save GradePassbackLog and AuditEvent
    API-->>Web: Updated grade status
```

## Content Publish From `course-materials`

```mermaid
sequenceDiagram
    actor Author
    participant Content as course-materials repo
    participant Tool as Content Build Tool
    participant API as Platform Import API
    participant DB as PostgreSQL

    Author->>Content: Edit Markdown / workbook source
    Author->>Content: Commit reviewed changes
    Author->>Tool: Run validation and build package
    Tool->>Content: Read v4 content and workbook source
    Tool->>Tool: Validate schema, links, cases, objectives
    Tool->>API: Publish content package
    API->>DB: Save ContentPackage and PublishRun
    API->>DB: Create draft CourseVersion
    DB-->>API: Draft version created
    API-->>Tool: Publish result
    Author->>API: Mark CourseVersion active after review
    API->>DB: Activate new CourseVersion
```

## Solution Reveal Audit

```mermaid
sequenceDiagram
    actor Student
    participant Web as Next.js Web App
    participant API as NestJS API
    participant DB as PostgreSQL

    Student->>Web: Click Show Solution
    Web->>API: POST solution reveal event
    API->>DB: Save AuditEvent
    API->>DB: Load solution if allowed
    DB-->>API: Solution content
    API-->>Web: Solution payload
    Web-->>Student: Display solution with warning
```
