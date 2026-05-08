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
  ["M2", "Module 3 lesson runtime", "Pilot"],
  ["M3", "Canvas embedded LTI", "Backlog"],
];

async function getModule3Previews(): Promise<LessonPreview[]> {
  try {
    const courseVersion = await prisma.courseVersion.findFirst({
      where: {
        courseId: "learn-database",
        status: "draft",
        modules: {
          some: {
            lessons: {
              some: {
                stableId: {
                  startsWith: "module-3.",
                },
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
                stableId: {
                  startsWith: "module-3.",
                },
              },
              orderBy: {
                lessonNumber: "asc",
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

    if (!courseVersion || !module) {
      return [];
    }

    return module.lessons.map((lesson) => ({
      id: lesson.stableId,
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
        metadata: parseMetadata(interaction.metadata),
      })),
    }));
  } catch (error) {
    console.error("Failed to load Module 3 previews", error);
    return [];
  }
}

export default async function Home() {
  const lessons = await getModule3Previews();
  const activityRows = [
    ["API health", "ok"],
    ["Web shell", "ok"],
    ["Local migration", "ok"],
    [
      "Module 3 import",
      lessons.length > 0
        ? `${lessons[0]?.courseVersion} (${lessons.length})`
        : "not found",
    ],
  ];

  return (
    <DashboardClient
      activityRows={activityRows}
      dashboardStats={dashboardStats}
      lessons={lessons}
      moduleRows={moduleRows}
    />
  );
}

function parseMetadata(value: string | null): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}
