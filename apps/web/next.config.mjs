import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@learn-database/workbook-schema"],
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
