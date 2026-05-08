import { buildModule3WorkbookPackageFromCourseMaterials } from "../course-materials/module-3.js";
import { validateWorkbookPackage } from "../index.js";

const module3WorkbookPackage = buildModule3WorkbookPackageFromCourseMaterials();
const result = validateWorkbookPackage(module3WorkbookPackage);

if (!result.valid) {
  console.error("Module 3 package validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Module 3 package validation passed");

if (result.warnings.length > 0) {
  console.log("Warnings:");
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}
