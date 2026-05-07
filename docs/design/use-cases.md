# Use Cases

## Actors

```mermaid
flowchart LR
    Student((Student))
    Instructor((Instructor))
    Author((Content Author))
    Admin((Platform Admin))
    Canvas((Canvas LMS))
    SQLService((SQL Execution Service))

    Student --> Platform[Workbook Platform]
    Instructor --> Platform
    Author --> Platform
    Admin --> Platform
    Canvas --> Platform
    Platform --> SQLService
```

## Student Use Cases

```mermaid
flowchart TB
    Student((Student))

    Student --> UC1[Open standalone lesson]
    Student --> UC2[Launch lesson from Canvas]
    Student --> UC3[Read workbook content]
    Student --> UC4[Answer interactive question]
    Student --> UC5[Run SQL query]
    Student --> UC6[Receive feedback]
    Student --> UC7[Save progress]
    Student --> UC8[Submit lesson attempt]
    Student --> UC9[View score]
    Student --> UC10[Reveal solution when allowed]

    UC2 --> LTI[LTI launch validation]
    UC5 --> SQL[SQL execution service]
    UC8 --> Grade[Grade calculation]
    UC8 --> Passback[Canvas grade passback when launched from Canvas]
```

## Instructor Use Cases

```mermaid
flowchart TB
    Instructor((Instructor))

    Instructor --> UC1[Preview active course version]
    Instructor --> UC2[Launch as Canvas instructor]
    Instructor --> UC3[Review student attempts]
    Instructor --> UC4[Review written responses]
    Instructor --> UC5[Adjust score manually]
    Instructor --> UC6[View question performance]
    Instructor --> UC7[Identify incomplete attempts]
    Instructor --> UC8[Resend grade passback]
    Instructor --> UC9[Export attempt data]

    UC4 --> Manual[Manual grading workflow]
    UC5 --> GradeResult[Update GradeResult]
    UC8 --> Canvas[Canvas AGS]
```

## Content Author Use Cases

```mermaid
flowchart TB
    Author((Content Author))

    Author --> UC1[Edit course content in course-materials]
    Author --> UC2[Validate workbook source]
    Author --> UC3[Build content package]
    Author --> UC4[Publish draft CourseVersion]
    Author --> UC5[Preview draft version]
    Author --> UC6[Activate approved version]
    Author --> UC7[Archive old version]

    UC1 --> Git[Git commit and review]
    UC2 --> Validator[Content validation]
    UC3 --> Package[ContentPackage]
    UC4 --> Platform[Platform import API]
```

## Platform Admin Use Cases

```mermaid
flowchart TB
    Admin((Platform Admin))

    Admin --> UC1[Register Canvas platform]
    Admin --> UC2[Configure LTI deployment]
    Admin --> UC3[Map Canvas course to platform course]
    Admin --> UC4[Monitor launch errors]
    Admin --> UC5[Monitor grade passback failures]
    Admin --> UC6[Manage active course versions]
    Admin --> UC7[Configure SQL execution endpoint]
    Admin --> UC8[Review audit events]
```

## Canvas LMS Use Cases

```mermaid
flowchart TB
    Canvas((Canvas LMS))

    Canvas --> UC1[Start OIDC login]
    Canvas --> UC2[Send LTI launch]
    Canvas --> UC3[Provide course context]
    Canvas --> UC4[Provide user roles]
    Canvas --> UC5[Provide line item for grading]
    Canvas --> UC6[Receive grade passback]
    Canvas --> UC7[Launch instructor preview]
```

## High-Level System Use Case Map

```mermaid
flowchart LR
    Student((Student))
    Instructor((Instructor))
    Author((Content Author))
    Admin((Platform Admin))
    Canvas((Canvas LMS))

    subgraph Platform[Workbook Platform]
        UC_Launch[Launch workbook]
        UC_Render[Render lesson]
        UC_Respond[Record responses]
        UC_Score[Calculate scores]
        UC_Passback[Pass grades to Canvas]
        UC_Review[Review attempts]
        UC_Publish[Publish course content]
        UC_Admin[Configure integrations]
    end

    Student --> UC_Launch
    Student --> UC_Render
    Student --> UC_Respond
    Student --> UC_Score

    Instructor --> UC_Review
    Instructor --> UC_Score

    Author --> UC_Publish
    Admin --> UC_Admin

    Canvas --> UC_Launch
    UC_Passback --> Canvas
    UC_Score --> UC_Passback
    UC_Publish --> UC_Render
```

## MVP Use Cases

The MVP should implement only these use cases first:

```mermaid
flowchart TB
    A[Publish one lesson from content source]
    B[Preview lesson standalone]
    C[Launch lesson from Canvas]
    D[Answer interactions]
    E[Save responses]
    F[Calculate score]
    G[Pass grade to Canvas]

    A --> B
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
```

Recommended first lesson for MVP:

```text
Lesson 3.2 Relationships and Cardinality
```

Reason:

- it exercises content blocks, choice questions, short answers, and self-checks
- it does not require full SQL sandboxing
- it supports the Lakeside/clinic relationship-pattern strategy
- it gives enough grading behavior to test Canvas passback
