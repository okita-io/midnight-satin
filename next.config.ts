import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack to this app. Stray lockfiles under $HOME (package-lock.json,
  // bun.lock) otherwise become the inferred workspace root and Next proxies
  // every request to itself → socket hang up / Internal Server Error.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
