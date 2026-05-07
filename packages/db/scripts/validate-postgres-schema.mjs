import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ??=
  "postgresql://user:password@localhost:5432/learn_database";

const result = spawnSync(
  "prisma",
  ["validate", "--schema", "prisma/schema.postgresql.prisma"],
  {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
