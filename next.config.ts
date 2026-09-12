import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin Turbopack to this app. Stray lockfiles under $HOME (package-lock.json,
  // bun.lock) otherwise become the inferred workspace root and Next proxies
  // every request to itself → socket hang up / Internal Server Error.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
