#!/usr/bin/env node

/**
 * Pull existing Replicate-generated images from URLs already stored in the DB.
 * Downloads each image to public/images/generated/ and updates the DB to use the local path.
 * Run this instead of re-running seed:test-data when you already have Replicate URLs in the DB.
 */

import { createPool } from './lib/postgres.mjs';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load env: optional ENV_FILE first, then fill in missing vars from .env.local and .env
const envFile = process.env.ENV_FILE || process.env.DOTENV_CONFIG_PATH;
if (envFile) {
  const resolved = path.isAbsolute(envFile) ? envFile : path.join(projectRoot, envFile);
  config({ path: resolved });
  // Fill in missing vars (e.g. POSTGRES_URL in .env.local when only REPLICATE_API_TOKEN is in .env)
  config({ path: path.join(projectRoot, '.env.local'), override: false });
  config({ path: path.join(projectRoot, '.env'), override: false });
  console.log(`Using env: ${envFile}\n`);
} else {
  config({ path: path.join(projectRoot, '.env') });
  config({ path: path.join(projectRoot, '.env.local'), override: true });
}

if (!process.env.POSTGRES_URL) {
  console.error('Missing POSTGRES_URL. Set it in .env or .env.local, or run with ENV_FILE=.env npm run db:pull-images');
  process.exit(1);
}

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

const REPLICATE_URL_PATTERN = /^https?:\/\/(replicate\.delivery|.*\.replicate\.delivery|replicate\.com)/i;

function isReplicateUrl(url) {
  return url && typeof url === 'string' && REPLICATE_URL_PATTERN.test(url);
}

function slug(str) {
  return String(str)
    .toLowerCase()
    .replace(/\s+/g, '-');
}

async function downloadToPublic(url, filename) {
  const dir = path.join(__dirname, '..', 'public', 'images', 'generated');
  await fs.mkdir(dir, { recursive: true });
  const filepath = path.join(dir, filename);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  return `/images/generated/${filename}`;
}

async function run() {
  console.log('Pulling Replicate images from DB URLs into public/images/generated/\n');

  const generatedDir = path.join(__dirname, '..', 'public', 'images', 'generated');
  await fs.mkdir(generatedDir, { recursive: true });

  let total = 0;

  // Authors: avatar_url
  const authors = await pool.query(
    `SELECT id, name, avatar_url FROM author_profiles WHERE avatar_url IS NOT NULL AND avatar_url != ''`
  );
  for (const row of authors.rows) {
    if (!isReplicateUrl(row.avatar_url)) continue;
    const filename = `author-${slug(row.name)}.webp`;
    try {
      const localPath = await downloadToPublic(row.avatar_url, filename);
      await pool.query(`UPDATE author_profiles SET avatar_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Author: ${row.name} -> ${filename}`);
      total++;
    } catch (e) {
      console.error(`  Author ${row.name}: ${e.message}`);
    }
  }

  // Novels: cover_image_url
  const novels = await pool.query(
    `SELECT id, title, cover_image_url FROM novels WHERE cover_image_url IS NOT NULL AND cover_image_url != ''`
  );
  for (const row of novels.rows) {
    if (!isReplicateUrl(row.cover_image_url)) continue;
    const filename = `cover-${slug(row.title)}.webp`;
    try {
      const localPath = await downloadToPublic(row.cover_image_url, filename);
      await pool.query(`UPDATE novels SET cover_image_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Novel: ${row.title} -> ${filename}`);
      total++;
    } catch (e) {
      console.error(`  Novel ${row.title}: ${e.message}`);
    }
  }

  // Characters: portrait_url (include novel_id for uniqueness)
  const characters = await pool.query(
    `SELECT c.id, c.novel_id, c.name, c.portrait_url FROM characters c WHERE c.portrait_url IS NOT NULL AND c.portrait_url != ''`
  );
  for (const row of characters.rows) {
    if (!isReplicateUrl(row.portrait_url)) continue;
    const filename = `character-${row.novel_id}-${slug(row.name)}.webp`;
    try {
      const localPath = await downloadToPublic(row.portrait_url, filename);
      await pool.query(`UPDATE characters SET portrait_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Character: ${row.name} -> ${filename}`);
      total++;
    } catch (e) {
      console.error(`  Character ${row.name}: ${e.message}`);
    }
  }

  console.log(`\nDone. Pulled ${total} image(s) and updated DB.`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
