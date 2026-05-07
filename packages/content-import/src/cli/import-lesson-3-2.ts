import { prisma } from "@learn-database/db";
import { lesson32WorkbookPackage } from "../fixtures/lesson-3-2.js";
import { importWorkbookPackage } from "../index.js";

try {
  const result = await importWorkbookPackage(lesson32WorkbookPackage, prisma);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
