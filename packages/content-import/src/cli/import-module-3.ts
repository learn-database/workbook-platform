import { prisma } from "@learn-database/db";
import { buildModule3WorkbookPackageFromCourseMaterials } from "../course-materials/module-3.js";
import { importWorkbookPackage } from "../index.js";

try {
  const module3WorkbookPackage =
    buildModule3WorkbookPackageFromCourseMaterials();
  const result = await importWorkbookPackage(module3WorkbookPackage, prisma);
  console.log(JSON.stringify(result, null, 2));
} finally {
  await prisma.$disconnect();
}
