#!/usr/bin/env node
/**
 * Run a SQL seed file against POSTGRES_URL (e.g. production Neon).
 *
 * Usage:
 *   node scripts/seed-sql.mjs --file src/lib/db/seed-devblog.sql
 *   ENV_FILE=.env.production.local node scripts/seed-sql.mjs --file src/lib/db/seed-news.sql
 */

import { readFileSync } from "fs";
import { createPool } from "@vercel/postgres";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const envFile = process.env.ENV_FILE || process.env.DOTENV_CONFIG_PATH;
if (envFile) {
  const resolved = path.isAbsolute(envFile)
    ? envFile
    : path.join(projectRoot, envFile);
  config({ path: resolved });
  config({ path: path.join(projectRoot, ".env.local"), override: false });
  config({ path: path.join(projectRoot, ".env"), override: false });
} else {
  config({ path: path.join(projectRoot, ".env") });
  config({ path: path.join(projectRoot, ".env.local"), override: true });
}

function parseArgs(argv) {
  /** @type {Record<string, string | boolean>} */
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function maskUrl(url) {
  return url.replace(/\/\/.*@/, "//***@");
}

async function main() {
  const args = parseArgs(process.argv);
  const relFile =
    typeof args.file === "string"
      ? args.file
      : "src/lib/db/seed-devblog.sql";
  const sqlPath = path.isAbsolute(relFile)
    ? relFile
    : path.join(projectRoot, relFile);

  if (!process.env.POSTGRES_URL) {
    console.error("Missing POSTGRES_URL.");
    console.error(
      "Set it in .env.local or pass ENV_FILE=path/to/production/env"
    );
    process.exit(1);
  }

  const sql = readFileSync(sqlPath, "utf-8");
  const pool = createPool({ connectionString: process.env.POSTGRES_URL });

  console.log(`Applying ${path.relative(projectRoot, sqlPath)}`);
  console.log(`  Target: ${maskUrl(process.env.POSTGRES_URL)}\n`);

  try {
    await pool.query(sql);
    const slugFromInsert = sql.match(
      /\n\s*'([a-z][a-z0-9-]*[a-z0-9])',\s*\n\s*'(?:editorial|announcement|campaign|ranking|popularity)'/m
    );
    const slug = slugFromInsert?.[1];
    if (slug) {
      const { rows } = await pool.query(
        `SELECT id, title, slug, is_published, is_featured, featured_order, published_at
         FROM news_articles WHERE slug = $1`,
        [slug]
      );
      if (rows[0]) {
        console.log("✅ Seed applied. Row in database:");
        console.log(`   slug: ${rows[0].slug}`);
        console.log(`   title: ${rows[0].title}`);
        console.log(`   featured: ${rows[0].is_featured} (order ${rows[0].featured_order})`);
        console.log(`   published: ${rows[0].is_published} @ ${rows[0].published_at}`);
      }
    } else {
      console.log("✅ Seed SQL executed successfully.");
    }
  } catch (err) {
    console.error("Error applying seed:", err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
