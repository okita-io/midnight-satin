#!/usr/bin/env node

/**
 * Fix stale Replicate CDN URLs in the database.
 * Replaces any replicate.delivery URLs with local /images/generated/ paths
 * by matching on the entity name + novel_id slug pattern used by generate-test-data.mjs.
 */

import { createPool } from '@vercel/postgres';
import { config } from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config({ path: '.env.local' });
config({ path: '.env' });

if (!process.env.POSTGRES_URL) {
  console.error('Missing POSTGRES_URL. Add it to .env.local (or .env).');
  process.exit(1);
}

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

function slug(str) {
  return String(str).toLowerCase().replace(/\s+/g, '-');
}

const REPLICATE_PATTERN = /^"?https?:\/\/(replicate\.delivery|.*\.replicate\.delivery|replicate\.com)/i;

function isReplicateUrl(url) {
  return url && typeof url === 'string' && REPLICATE_PATTERN.test(url);
}

async function fileExists(filepath) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  console.log('Fixing stale Replicate URLs in database...\n');

  const generatedDir = path.join(__dirname, '..', 'public', 'images', 'generated');
  let fixed = 0;
  let skipped = 0;

  // Fix author avatar_url
  const authors = await pool.query(
    `SELECT id, name, avatar_url FROM author_profiles WHERE avatar_url IS NOT NULL`
  );
  for (const row of authors.rows) {
    if (!isReplicateUrl(row.avatar_url)) continue;
    const filename = `author-${slug(row.name)}.webp`;
    const filepath = path.join(generatedDir, filename);
    const localPath = `/images/generated/${filename}`;
    if (await fileExists(filepath)) {
      await pool.query(`UPDATE author_profiles SET avatar_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Fixed author "${row.name}" -> ${localPath}`);
      fixed++;
    } else {
      console.warn(`  SKIP author "${row.name}": file not found at ${filepath}`);
      skipped++;
    }
  }

  // Fix novel cover_image_url
  const novels = await pool.query(
    `SELECT id, title, cover_image_url FROM novels WHERE cover_image_url IS NOT NULL`
  );
  for (const row of novels.rows) {
    if (!isReplicateUrl(row.cover_image_url)) continue;
    const filename = `cover-${slug(row.title)}.webp`;
    const filepath = path.join(generatedDir, filename);
    const localPath = `/images/generated/${filename}`;
    if (await fileExists(filepath)) {
      await pool.query(`UPDATE novels SET cover_image_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Fixed novel "${row.title}" -> ${localPath}`);
      fixed++;
    } else {
      console.warn(`  SKIP novel "${row.title}": file not found at ${filepath}`);
      skipped++;
    }
  }

  // Fix character portrait_url
  // Characters from the first seed run have different novel_ids than the images on disk.
  // Build a lookup: novel title -> second-run novel_id (the one with local image files).
  const novelLookup = new Map();
  for (const row of novels.rows) {
    if (!isReplicateUrl(row.cover_image_url)) {
      const title = row.title;
      if (!novelLookup.has(title)) {
        novelLookup.set(title, row.id);
      }
    }
  }

  const characters = await pool.query(
    `SELECT c.id, c.novel_id, c.name, c.portrait_url, n.title AS novel_title
     FROM characters c
     JOIN novels n ON n.id = c.novel_id
     WHERE c.portrait_url IS NOT NULL`
  );
  for (const row of characters.rows) {
    if (!isReplicateUrl(row.portrait_url)) continue;

    // Try exact novel_id first
    let filename = `character-${row.novel_id}-${slug(row.name)}.webp`;
    let filepath = path.join(generatedDir, filename);

    if (!(await fileExists(filepath))) {
      // Fall back: find the novel_id from the second run by matching title
      const altNovelId = novelLookup.get(row.novel_title);
      if (altNovelId && altNovelId !== row.novel_id) {
        filename = `character-${altNovelId}-${slug(row.name)}.webp`;
        filepath = path.join(generatedDir, filename);
      }
    }

    const localPath = `/images/generated/${filename}`;
    if (await fileExists(filepath)) {
      await pool.query(`UPDATE characters SET portrait_url = $1 WHERE id = $2`, [localPath, row.id]);
      console.log(`  Fixed character "${row.name}" -> ${localPath}`);
      fixed++;
    } else {
      console.warn(`  SKIP character "${row.name}" (novel ${row.novel_id}): file not found at ${filepath}`);
      skipped++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} URL(s), skipped ${skipped}.`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
