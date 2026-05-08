import { prisma } from "@learn-database/db";
import { buildLesson32WorkbookPackageFromCourseMaterials } from "../course-materials/lesson-3-2.js";
import { importWorkbookPackage } from "../index.js";

try {
  const lesson32WorkbookPackage =
    buildLesson32WorkbookPackageFromCourseMaterials();
  const result = await importWorkbookPackage(lesson32WorkbookPackage, prisma);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
