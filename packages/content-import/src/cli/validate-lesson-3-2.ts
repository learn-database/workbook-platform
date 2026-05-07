import { lesson32WorkbookPackage } from "../fixtures/lesson-3-2.js";
import { validateWorkbookPackage } from "../index.js";

const result = validateWorkbookPackage(lesson32WorkbookPackage);

if (!result.valid) {
  console.error("Lesson 3.2 package validation failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Lesson 3.2 package validation passed");

if (result.warnings.length > 0) {
  console.log("Warnings:");
  for (const warning of result.warnings) {
    console.log(`- ${warning}`);
  }
}
