import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl?.startsWith("postgresql://")) {
  console.error(
    "Set DATABASE_URL to a PostgreSQL connection string before running this command.",
  );
  process.exit(1);
}

const result = spawnSync("prisma", process.argv.slice(2), {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

process.exit(result.status ?? 1);
