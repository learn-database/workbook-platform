import { prisma } from "@learn-database/db";
import { WORKBOOK_SCHEMA_VERSION } from "@learn-database/workbook-schema";
import { DashboardClient, type LessonPreview } from "./workbook-client";

export const dynamic = "force-dynamic";

const dashboardStats = [
  ["Course", "Learn Database"],
  ["Runtime", "SQLite local"],
  ["Canvas", "LTI scaffold"],
  ["Schema", WORKBOOK_SCHEMA_VERSION],
];

const moduleRows = [
  ["M0", "Platform foundation", "Merged"],
  ["M1", "Content import and schema", "Imported"],
  ["M2", "Lesson runtime", "In progress"],
  ["M3", "Canvas embedded LTI", "Backlog"],
];

async function getLesson32Preview(): Promise<LessonPreview | null> {
  try {
    const courseVersion = await prisma.courseVersion.findFirst({
      where: {
        courseId: "learn-database",
        status: "draft",
        modules: {
          some: {
            lessons: {
              some: {
                stableId: "module-3.lesson-3.2.relationships-and-cardinality",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        modules: {
          orderBy: {
            number: "asc",
          },
          include: {
            lessons: {
              where: {
                stableId: "module-3.lesson-3.2.relationships-and-cardinality",
              },
              include: {
                contentBlocks: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
                interactions: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                  include: {
                    options: {
                      orderBy: {
                        sortOrder: "asc",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const module = courseVersion?.modules.find(
      (item) => item.lessons.length > 0,
    );
    const lesson = module?.lessons[0];

    if (!courseVersion || !module || !lesson) {
      return null;
    }

    return {
      courseVersion: courseVersion.versionLabel,
      moduleTitle: module.title,
      lessonTitle: lesson.title,
      lessonNumber: lesson.lessonNumber,
      slug: lesson.slug,
      overview: lesson.overview,
      schemaVersion: courseVersion.schemaVersion,
      contentBlocks: lesson.contentBlocks.map((block) => ({
        id: block.stableId,
        sortOrder: block.sortOrder,
        kind: block.kind,
        title: block.title,
        body: block.body,
      })),
      interactions: lesson.interactions.map((interaction) => ({
        id: interaction.stableId,
        sortOrder: interaction.sortOrder,
        kind: interaction.kind,
        title: interaction.title,
        prompt: interaction.prompt,
        body: interaction.body,
        scoringMode: interaction.scoringMode,
        points: interaction.points,
        gradingPrompt: interaction.gradingPrompt,
        answerKey: interaction.answerKey,
        options: interaction.options.map((option) => ({
          id: option.stableId,
          text: option.text,
          value: option.value,
        })),
      })),
    };
  } catch (error) {
    console.error("Failed to load Lesson 3.2 preview", error);
    return null;
  }
}

export default async function Home() {
  const lesson = await getLesson32Preview();
  const activityRows = [
    ["API health", "ok"],
    ["Web shell", "ok"],
    ["Local migration", "ok"],
    ["Lesson 3.2 import", lesson ? lesson.courseVersion : "not found"],
  ];

  return (
    <DashboardClient
      activityRows={activityRows}
      dashboardStats={dashboardStats}
      lesson={lesson}
      moduleRows={moduleRows}
    />
  );
}
