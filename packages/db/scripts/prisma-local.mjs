import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ??= "file:./dev.db";

const result = spawnSync("prisma", process.argv.slice(2), {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

process.exit(result.status ?? 1);
