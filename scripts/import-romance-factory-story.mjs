#!/usr/bin/env node
/**
 * Import a completed Romance Factory story directory into Midnight Satin:
 * - Read author_profile, book cover metadata, character_dossiers, chapters
 * - Generate cover / author / character images via Replicate (recraft-v4), save under public/images/generated/
 * - Insert author, novel, chapters, and characters into Neon (POSTGRES_URL)
 * - Optionally git-add/commit new images so Vercel can deploy static assets
 *
 * Requires: .env.local in midnightsatin with POSTGRES_URL, REPLICATE_API_TOKEN, BLOB_* not required (local paths).
 *
 * Usage:
 *   node scripts/import-romance-factory-story.mjs --story-path /path/to/story
 *   node scripts/import-romance-factory-story.mjs --story-path ./stories/foo --featured --featured-order 1
 *   node scripts/import-romance-factory-story.mjs --story-path ... --skip-images --no-git
 */

import { createPool } from "@vercel/postgres";
import { config } from "dotenv";
import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Replicate from "replicate";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const envFile = process.env.ENV_FILE || process.env.DOTENV_CONFIG_PATH;
if (envFile) {
  const resolved = path.isAbsolute(envFile) ? envFile : path.join(projectRoot, envFile);
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
  const positionals = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const raw = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[raw] = true;
      } else {
        out[raw] = next;
        i++;
      }
    } else {
      positionals.push(a);
    }
  }
  return { args: out, positionals };
}

function slug(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "story";
}

async function readJsonIfExists(p) {
  try {
    const t = await fs.readFile(p, "utf8");
    const o = JSON.parse(t);
    return typeof o === "object" && o ? o : {};
  } catch {
    return null;
  }
}

function titleCaseRole(role) {
  if (!role || typeof role !== "string") return "Cast member";
  return role
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Load chapters: prefer chapters/chapter_NN.md; else split manuscript.txt.
 * @returns {{ number: number, title: string, content: string }[]}
 */
async function loadChapters(storyPath) {
  const chaptersDir = path.join(storyPath, "chapters");
  let files = [];
  try {
    files = (await fs.readdir(chaptersDir))
      .filter((f) => /^chapter_\d+\.md$/i.test(f))
      .sort((a, b) => {
        const na = parseInt(a.match(/chapter_(\d+)/i)?.[1] || "0", 10);
        const nb = parseInt(b.match(/chapter_(\d+)/i)?.[1] || "0", 10);
        return na - nb;
      });
  } catch {
    files = [];
  }

  if (files.length > 0) {
    const out = [];
    for (const f of files) {
      const num = parseInt(f.match(/chapter_(\d+)/i)?.[1] || "0", 10);
      const raw = await fs.readFile(path.join(chaptersDir, f), "utf8");
      const lines = raw.replace(/^\uFEFF/, "").split("\n");
      let title = `Chapter ${num}`;
      let start = 0;
      if (lines[0]?.trim().startsWith("#")) {
        title = lines[0].replace(/^#+\s*/, "").trim() || title;
        start = 1;
      }
      const content = lines.slice(start).join("\n").trim();
      out.push({ number: num, title, content });
    }
    return out;
  }

  const manuscript = path.join(storyPath, "manuscript.txt");
  try {
    const text = await fs.readFile(manuscript, "utf8");
    const parts = text.split(/\n\n---\n\n+/);
    const out = [];
    let n = 0;
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      n += 1;
      const lines = trimmed.split("\n");
      let title = `Chapter ${n}`;
      let start = 0;
      if (lines[0]?.trim().startsWith("#")) {
        title = lines[0].replace(/^#+\s*/, "").trim() || title;
        start = 1;
      }
      out.push({
        number: n,
        title,
        content: lines.slice(start).join("\n").trim(),
      });
    }
    if (out.length) return out;
  } catch {
    /* no manuscript */
  }
  return [];
}

/**
 * Character rows from character_dossiers.json (v2: characters map, or motivations array)
 */
function extractCharacters(dossiers) {
  if (!dossiers || typeof dossiers !== "object") return [];
  const rows = [];
  const chars = dossiers.characters;
  if (chars && typeof chars === "object" && !Array.isArray(chars)) {
    for (const [name, cm] of Object.entries(chars)) {
      if (!name || !cm || typeof cm !== "object") continue;
      rows.push({
        name: String(name),
        role: String(cm.role || ""),
        portrait_prompt: String(cm.portrait_prompt || "").trim(),
        physical_description: String(cm.physical_description || "").trim(),
        secret: String(cm.secret || "").trim(),
        description: [cm.physical_description, cm.conscious_want]
          .filter(Boolean)
          .map(String)
          .join(" "),
        backstory: String(cm.wound || cm.fear || cm.unconscious_need || "").trim() || null,
        stats: {
          role: String(cm.role || ""),
        },
        secrets: cm.secret ? [String(cm.secret)] : [],
      });
    }
    return rows;
  }
  const motivations = dossiers.motivations;
  if (Array.isArray(motivations)) {
    for (const m of motivations) {
      if (!m || typeof m !== "object") continue;
      const name = m.name;
      if (!name) continue;
      rows.push({
        name: String(name),
        role: String(m.role || ""),
        portrait_prompt: String(m.portrait_prompt || "").trim(),
        physical_description: String(m.physical_description || "").trim(),
        secret: String(m.secret || "").trim(),
        description: [m.physical_description, m.conscious_want]
          .filter(Boolean)
          .map(String)
          .join(" "),
        backstory: String(m.wound || m.fear || m.unconscious_need || "").trim() || null,
        stats: { role: String(m.role || "") },
        secrets: m.secret ? [String(m.secret)] : [],
      });
    }
  }
  return rows;
}

async function generateImage(replicate, prompt, destBasename, aspectRatio = "1:1", dryRun) {
  if (dryRun) {
    const base = String(destBasename).replace(/\.webp$/i, "");
    return `/images/generated/${base}.webp`;
  }
  const output = await replicate.run("recraft-ai/recraft-v4", {
    input: { prompt, aspect_ratio: aspectRatio },
  });
  let url = typeof output === "string" ? output : output?.[0] ?? (output?.url?.() ?? null);
  if (!url) return null;
  url = String(url).replace(/^"|"$/g, "");
  const baseName = path.basename(String(destBasename), path.extname(String(destBasename)));
  const savedFilename = `${baseName}.webp`;
  const outPath = path.join(projectRoot, "public", "images", "generated", savedFilename);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching image`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(outPath, buffer);
  return `/images/generated/${savedFilename}`;
}

async function main() {
  const { args } = parseArgs(process.argv);
  const storyPathArg = args["story-path"] || args.storypath;
  const storyPath = storyPathArg
    ? path.isAbsolute(String(storyPathArg))
      ? String(storyPathArg)
      : path.resolve(String(storyPathArg))
    : null;

  if (!storyPath) {
    console.error("Missing --story-path <dir> (completed Romance Factory story directory)");
    process.exit(1);
  }

  const dryRun = Boolean(args["dry-run"] || args.dryrun);
  const skipImages = Boolean(args["skip-images"] || args.skipimages);
  const noGit = Boolean(args["no-git"] || args.nogit);
  const featured = Boolean(args.featured);
  const featuredOrder = args["featured-order"] != null ? Number(args["featured-order"]) : null;
  const maxCharacters = args["max-characters"] != null ? Math.max(1, Number(args["max-characters"])) : 12;
  const reuseAuthorId = (args["reuse-author-id"] || args["author-id"] || "").toString().trim() || null;

  let stat;
  try {
    stat = await fs.stat(storyPath);
  } catch {
    console.error(`Story path is not accessible: ${storyPath}`);
    process.exit(1);
  }
  if (!stat.isDirectory()) {
    console.error(`Not a directory: ${storyPath}`);
    process.exit(1);
  }

  if (!dryRun && !process.env.POSTGRES_URL) {
    console.error("Missing POSTGRES_URL. Add to midnightsatin .env.local (Neon from Vercel).");
    process.exit(1);
  }
  if (!skipImages && !dryRun && !process.env.REPLICATE_API_TOKEN) {
    console.error("Missing REPLICATE_API_TOKEN. Add to .env or .env.local, or pass --skip-images");
    process.exit(1);
  }

  const pool = dryRun
    ? null
    : createPool({ connectionString: process.env.POSTGRES_URL });
  const replicate = skipImages || dryRun ? null : new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  const storySlug = slug(path.basename(storyPath));

  const [authorProfile, bookCover, outline, dossiers, manuscriptMeta] = await Promise.all([
    readJsonIfExists(path.join(storyPath, "author_profile.json")),
    readJsonIfExists(path.join(storyPath, "book_cover.json")),
    readJsonIfExists(path.join(storyPath, "story_outline.json")),
    readJsonIfExists(path.join(storyPath, "character_dossiers.json")),
    readJsonIfExists(path.join(storyPath, "manuscript_metadata.json")),
  ]);

  const bcp = bookCover || (manuscriptMeta && manuscriptMeta.book_cover_prompt) || {};
  const storyArc = outline && outline.story_arc ? outline.story_arc : {};
  const title =
    (bcp && bcp.title) || storyArc.title || path.basename(storyPath);
  const synopsis = String(
    (bcp && bcp.back_cover_blurb) || storyArc.premise || storyArc.logline || ""
  ).slice(0, 12000);
  const coverPrompt = String(
    (bcp && bcp.cover_image_prompt) || ""
  ).trim();
  const authorName = String(
    (bcp && bcp.author_name) ||
      (authorProfile && (authorProfile.pen_name || authorProfile.name)) ||
      "Author"
  ).trim();
  const authorBio = String(
    (authorProfile && (authorProfile.biography || authorProfile.bio)) || "Romance author."
  ).slice(0, 8000);
  const authorPortraitPrompt = String(
    (authorProfile && authorProfile.author_portrait_prompt) || ""
  ).trim();
  let styleTags = [];
  if (authorProfile && Array.isArray(authorProfile.style_tags)) {
    styleTags = authorProfile.style_tags.map(String);
  } else if (bcp && Array.isArray(bcp.genre_tags)) {
    styleTags = bcp.genre_tags.map(String);
  } else if (storyArc && storyArc.subgenre) {
    styleTags = [String(storyArc.subgenre)];
  }
  if (!styleTags.length) styleTags = ["Romance"];

  const novelGenreTags = Array.isArray(bcp?.genre_tags)
    ? bcp.genre_tags.map(String)
    : styleTags;

  const chapters = await loadChapters(storyPath);
  if (chapters.length === 0) {
    console.error("No chapters found. Add chapters/chapter_*.md or manuscript.txt with parts.");
    process.exit(1);
  }

  const characters = extractCharacters(dossiers || {}).slice(0, maxCharacters);

  console.log(`Story: ${title}`);
  console.log(`  Slug: ${storySlug}  Chapters: ${chapters.length}  Characters: ${characters.length}${dryRun ? "  (dry-run)" : ""}`);

  const createdFiles = [];
  const authorImagePrompt = authorPortraitPrompt
    ? `Professional book-jacket author portrait. ${authorPortraitPrompt}`
    : `Professional headshot, romance novelist, ${authorName}, ${authorBio.slice(0, 200)}, elegant, natural lighting, warm, editorial photo`;

  const coverImagePrompt = coverPrompt
    ? `Romance novel cover art, no on-image text or typography. ${coverPrompt}`
    : `Romance novel cover art, no on-image text. ${title}: ${synopsis.slice(0, 400)}`;

  let authorId = reuseAuthorId;
  let authorAvatar = "/seed/images/author_avatar.png";
  if (!authorId) {
    if (!skipImages && replicate) {
      authorAvatar =
        (await generateImage(
          replicate,
          authorImagePrompt,
          `author-${storySlug}`,
          "2:3",
          dryRun
        )) || authorAvatar;
    }
    if (authorAvatar && authorAvatar.startsWith("/images/")) {
      createdFiles.push(path.join(projectRoot, "public", authorAvatar.replace(/^\//, "")));
    }

    if (dryRun) {
      authorId = "00000000-0000-0000-0000-000000000001";
    } else {
      const { rows: ar } = await pool.query(
        `INSERT INTO author_profiles (name, avatar_url, biography, style_tags)
         VALUES ($1, $2, $3, $4::text[])
         RETURNING id`,
        [authorName, authorAvatar, authorBio, styleTags]
      );
      authorId = ar[0].id;
    }
  } else {
    if (!skipImages && replicate) {
      authorAvatar =
        (await generateImage(
          replicate,
          authorImagePrompt,
          `author-${storySlug}`,
          "2:3",
          dryRun
        )) || authorAvatar;
    }
    if (authorAvatar.startsWith("/images/") && !dryRun) {
      createdFiles.push(path.join(projectRoot, "public", authorAvatar.replace(/^\//, "")));
      await pool.query(
        `UPDATE author_profiles SET avatar_url = $1 WHERE id = $2`,
        [authorAvatar, authorId]
      );
    }
  }

  let coverPath = "/seed/images/novel_cover.png";
  if (!skipImages && replicate) {
    coverPath =
      (await generateImage(
        replicate,
        coverImagePrompt,
        `cover-${storySlug}`,
        "3:4",
        dryRun
      )) || coverPath;
  }
  if (coverPath.startsWith("/images/")) {
    createdFiles.push(path.join(projectRoot, "public", coverPath.replace(/^\//, "")));
  }

  const publicationDate = new Date().toISOString().slice(0, 10);
  const seriesId = null;
  const isFeatured = featured;
  const featOrder = Number.isFinite(featuredOrder) ? featuredOrder : null;

  let novelId;
  if (dryRun) {
    novelId = "00000000-0000-0000-0000-000000000002";
  } else {
    const { rows: nr } = await pool.query(
      `INSERT INTO novels
        (title, series_id, author_id, cover_image_url, synopsis, genre_tags, publication_date, is_featured, featured_order)
       VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9)
       RETURNING id`,
      [
        title,
        seriesId,
        authorId,
        coverPath,
        synopsis || "—",
        novelGenreTags,
        publicationDate,
        isFeatured,
        featOrder,
      ]
    );
    novelId = nr[0].id;
  }

  for (const ch of chapters) {
    const isFree = ch.number === 1;
    if (dryRun) {
      /* skip */
    } else {
      await pool.query(
        `INSERT INTO chapters (novel_id, chapter_number, title, content, is_free)
         VALUES ($1, $2, $3, $4, $5)`,
        [novelId, ch.number, ch.title, ch.content, isFree]
      );
    }
  }

  for (const c of characters) {
    const portraitHint = c.portrait_prompt
      ? c.portrait_prompt
      : `Romance character portrait, head and shoulders, cinematic. ${c.name}. ${c.physical_description}`.trim();
    const fullPrompt = `No text, no watermarks. ${portraitHint}`;
    let pUrl = "/seed/images/character_portrait_1.png";
    if (!skipImages && replicate) {
      pUrl =
        (await generateImage(
          replicate,
          fullPrompt,
          `character-${novelId}-${slug(c.name)}`,
          "1:1",
          dryRun
        )) || pUrl;
    }
    if (pUrl.startsWith("/images/")) {
      createdFiles.push(path.join(projectRoot, "public", pUrl.replace(/^\//, "")));
    }
    if (!dryRun) {
      const desc = (c.description || c.physical_description || c.name).slice(0, 2000);
      const statsJson = JSON.stringify(c.stats || {});
      const secrets = Array.isArray(c.secrets) && c.secrets.length ? c.secrets : c.secret ? [c.secret] : [];
      await pool.query(
        `INSERT INTO characters
          (novel_id, name, role_subtitle, portrait_url, description, backstory, stats, secrets)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::text[])`,
        [
          novelId,
          c.name,
          titleCaseRole(c.role),
          pUrl,
          desc,
          c.backstory,
          statsJson,
          secrets,
        ]
      );
    }
  }

  const manifest = {
    storyPath,
    storySlug,
    title,
    authorId,
    novelId,
    imagePaths: {
      authorAvatar: authorAvatar || null,
      cover: coverPath,
    },
    chapters: chapters.length,
    characters: characters.length,
  };
  const manifestPath = path.join(storyPath, "midnightsatin_import.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`Wrote ${manifestPath}`);

  if (!dryRun) await pool.end();

  if (noGit || dryRun) {
    console.log(noGit ? "Skipped git (--no-git)." : "Skipped git (dry-run).");
    return;
  }

  try {
    const relFiles = [
      ...new Set(
        createdFiles
          .map((f) => path.relative(projectRoot, f))
          .filter((f) => f && !f.startsWith(".."))
      ),
    ];
    for (const r of relFiles) {
      execSync(`git add -- "${r}"`, { cwd: projectRoot, stdio: "inherit" });
    }
    if (relFiles.length === 0) {
      console.log("No new /images/generated files to add (skipped commit).");
      return;
    }
    execSync(
      `git commit -m "Add generated assets: ${title.replace(/"/g, "'")} (${storySlug})"`,
      { cwd: projectRoot, stdio: "inherit" }
    );
    console.log("Git commit created. Push to deploy on Vercel.");
  } catch (e) {
    console.warn("Git step failed (not a git repo, or nothing to commit):", e?.message || e);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
