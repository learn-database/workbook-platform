import {
  WORKBOOK_SCHEMA_VERSION,
  type WorkbookLesson,
} from "@learn-database/workbook-schema";
import type { WorkbookPackage } from "../index.js";

const lesson32: WorkbookLesson = {
  schemaVersion: WORKBOOK_SCHEMA_VERSION,
  id: "module-3.lesson-3.2.relationships-and-cardinality",
  moduleNumber: 3,
  lessonNumber: 2,
  slug: "relationships-and-cardinality",
  title: "Relationships and Cardinality",
  overview:
    "Relationships are not just diagram lines. A relationship states how the business works. Cardinality and participation explain what the organization allows, what it requires, and what would be false if the model showed the wrong pattern.",
  caseRefs: ["lakeside-tutoring-center"],
  interactions: [
    {
      id: "lesson-3.2-overview",
      kind: "content_block",
      title: "Lesson Overview",
      body: "In Lesson 3.1, students learned how to identify entities, attributes, identifiers, and weak entities. Lesson 3.2 adds the next modeling judgment: once the business knows what it must track, how do those tracked things connect?",
    },
    {
      id: "case-lakeside-tutoring-center",
      kind: "case_card",
      title: "Lakeside Tutoring Center",
      case: {
        id: "lakeside-tutoring-center",
        title: "Lakeside Tutoring Center",
        summary:
          "The primary course case used to reason about students, tutors, sessions, subjects, enrollments, and relationship patterns.",
        tables: [
          "Student",
          "Tutor",
          "TutoringSession",
          "Subject",
          "SessionSubject",
        ],
      },
    },
    {
      id: "classify-volunteer-event",
      kind: "choice_interaction",
      prompt:
        "A nonprofit tracks Volunteer and Event. A volunteer may serve at many events. Each event includes many volunteers. Which relationship pattern best represents the case?",
      options: [
        { id: "one-to-many", text: "One-to-many" },
        { id: "many-to-many", text: "Many-to-many" },
        { id: "recursive-hierarchy", text: "Recursive hierarchy" },
      ],
      scoring: {
        mode: "automatic",
        points: 1,
        answerKey: "many-to-many",
        rubric: [
          "Chooses many-to-many because both sides can relate to many instances on the other side.",
        ],
      },
    },
    {
      id: "relationship-pattern-practice",
      kind: "relationship_pattern_activity",
      prompt:
        "Label the relationship patterns in the lesson examples, including recursive hierarchy and recursive network.",
      patterns: ["1:N", "N:M", "recursive hierarchy", "recursive network"],
      schemaContext:
        "Use the lesson examples for Advisor-Student, Student-Course, Provider-Provider, and User-User.",
      scoring: {
        mode: "self_graded",
        points: 2,
        rubric: [
          "Labels recursive hierarchy as a self-referencing 1:N pattern.",
          "Labels recursive network as a self-referencing N:M pattern.",
          "Uses case evidence instead of surface wording.",
        ],
      },
    },
    {
      id: "repair-technician-workorder",
      kind: "design_judgment",
      prompt:
        "A repair shop tracks Technician and WorkOrder. One technician may handle many work orders over time. Each work order is assigned to one lead technician. A classmate models the relationship as many-to-many. Critique and repair the relationship choice.",
      decisionPrompt:
        "Explain what is wrong with the many-to-many model, what false business story it tells, and what relationship pattern should replace it.",
      tradeoffs: [
        "accountability for the lead technician",
        "accurate service history",
        "not inventing shared assignment without case evidence",
      ],
      scoring: {
        mode: "grading_prompt",
        points: 3,
        gradingPrompt:
          "Award credit when the response identifies the correct 1:N pattern, explains that many-to-many falsely implies shared assignment, and cites the case rule that each work order has one lead technician.",
        rubric: [
          "Names the flawed many-to-many assumption.",
          "Explains the false business meaning.",
          "Replaces it with a defensible one-to-many relationship.",
        ],
      },
    },
    {
      id: "project-checkpoint-relationship-rules",
      kind: "project_checkpoint",
      prompt:
        "Before Lesson 3.3, write two or three relationship rules from your project case in plain language.",
      deliverable: "Plain-language relationship rules for the project case.",
      selfCheckCriteria: [
        "Each rule names the real business action or responsibility.",
        "Each rule states maximum participation on both sides.",
        "Each rule states minimum participation or optionality.",
        "The response identifies who or what becomes invisible if the relationship is modeled carelessly.",
      ],
      scoring: {
        mode: "self_graded",
        points: 1,
        rubric: [
          "Student confirms the relationship rules are stated in plain language and supported by case evidence.",
        ],
      },
    },
  ],
};

export const lesson32WorkbookPackage: WorkbookPackage = {
  packageVersion: "0.1.0",
  course: {
    id: "learn-database",
    slug: "learn-database",
    title: "Learn Database",
    description: "Interactive workbook course for database management.",
  },
  courseVersion: {
    versionLabel: "v4-draft",
    schemaVersion: WORKBOOK_SCHEMA_VERSION,
    sourceRepo: "learn-database/course-materials",
    sourceRef:
      "textbook/v4/drafts/module-3-core-data-modeling/lesson-3.2-relationships-and-cardinality.md",
  },
  cases: [
    {
      id: "lakeside-tutoring-center",
      title: "Lakeside Tutoring Center",
      summary:
        "Primary course case for modeling tutoring sessions, students, tutors, subjects, and later user-role redesign decisions.",
      primaryUse: "primary",
      content: {
        source: "textbook/v4/cases/lakeside-tutoring-center-primary-case.md",
      },
    },
  ],
  modules: [
    {
      id: "module-3-core-data-modeling",
      number: 3,
      slug: "core-data-modeling",
      title: "Core Data Modeling",
      overview:
        "Module 3 builds conceptual modeling skill focused on entities, attributes, relationships, cardinality, optionality, critique, and defense.",
      lessons: [lesson32],
    },
  ],
};
