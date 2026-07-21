#!/usr/bin/env node
/**
 * Import a completed Romance Factory story directory into Midnight Satin:
 * - Read author_profile, book cover metadata, character_dossiers, chapters
 * - Prefer pre-generated SDXL assets from publish_manifest.json + publish_images/
 * - Fall back to Replicate (recraft-v4) only when local cover+author images are absent
 * - Insert author, novel, chapters, and characters into Neon (POSTGRES_URL)
 * - Optionally git-add/commit new images so Vercel can deploy static assets
 *
 * Requires: .env.local in midnightsatin with POSTGRES_URL.
 * REPLICATE_API_TOKEN is only required when local publish images are incomplete.
 *
 * Usage:
 *   node scripts/import-romance-factory-story.mjs --story-path /path/to/story
 *   node scripts/import-romance-factory-story.mjs --story-path ./stories/foo --featured --featured-order 1
 *   node scripts/import-romance-factory-story.mjs --story-path ... --skip-images --no-git
 */

import { createPool } from "./lib/postgres.mjs";
import { config } from "dotenv";
import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Replicate from "replicate";
import {
  loadRfProvenanceDir,
  resolveRfStoryId,
} from "./lib/rf-provenance.mjs";

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

function unwrapJsonArtifact(obj) {
  if (!obj || typeof obj !== "object") return obj;
  // Romance Factory v2 often stores disk artifacts as JSONArtifact envelopes with parsed_data.
  if (obj.parsed_data && typeof obj.parsed_data === "object" && obj.parsed_data) {
    return obj.parsed_data;
  }
  // Some artifacts may have "text" containing a JSON string; parse best-effort.
  if (typeof obj.text === "string") {
    const s = obj.text.trim();
    if (s.startsWith("{") && s.endsWith("}")) {
      try {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === "object") return parsed;
      } catch {
        /* ignore */
      }
    }
  }
  return obj;
}

function titleCaseRole(role) {
  if (!role || typeof role !== "string") return "Cast member";
  return role
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function uniqStrings(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    const s = String(x ?? "").trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function pickString(...vals) {
  for (const v of vals) {
    if (isNonEmptyString(v)) return v.trim();
  }
  return "";
}

function validateStoryBundle({
  storyPath,
  authorProfile,
  bookCover,
  outline,
  dossiers,
  manuscriptMeta,
  chapters,
  allowDefaults,
}) {
  const errors = [];
  const warnings = [];

  const storyArc = outline && outline.story_arc ? outline.story_arc : {};
  const bcp = bookCover || (manuscriptMeta && manuscriptMeta.book_cover_prompt) || {};

  const title = pickString(bcp?.title, storyArc?.title);
  const synopsis = pickString(bcp?.back_cover_blurb, storyArc?.premise, storyArc?.logline);
  const coverPrompt = pickString(bcp?.cover_image_prompt);
  const authorName = pickString(
    bcp?.author_name,
    authorProfile?.pen_name,
    authorProfile?.name
  );
  const authorBio = pickString(authorProfile?.biography, authorProfile?.bio);
  const genreTags = uniqStrings(bcp?.genre_tags ?? authorProfile?.style_tags ?? (storyArc?.subgenre ? [storyArc.subgenre] : []));

  // Required for a clean upload (unless explicitly allowing defaults).
  if (!isNonEmptyString(title)) errors.push("Missing title (book_cover.json.title or story_outline.json.story_arc.title).");
  if (!isNonEmptyString(authorName)) errors.push("Missing author name (book_cover.json.author_name or author_profile.json.pen_name/name).");
  if (!isNonEmptyString(synopsis)) errors.push("Missing synopsis/blurb (book_cover.json.back_cover_blurb or story_outline.json.story_arc.premise/logline).");
  if (genreTags.length === 0) errors.push("Missing genre tags (book_cover.json.genre_tags or author_profile.json.style_tags).");
  if (!Array.isArray(chapters) || chapters.length === 0) errors.push("Missing chapters (chapters/chapter_*.md or manuscript.txt split).");

  // Strict finalization: require these fields be authored/generated, not silently synthesized.
  if (!allowDefaults) {
    if (!isNonEmptyString(coverPrompt)) errors.push("Missing cover image prompt (book_cover.json.cover_image_prompt).");
    if (!isNonEmptyString(authorBio)) errors.push("Missing author biography (author_profile.json.biography/bio).");
  } else {
    if (!isNonEmptyString(coverPrompt)) warnings.push("Cover image prompt missing; will be synthesized from title + synopsis.");
    if (!isNonEmptyString(authorBio)) warnings.push("Author bio missing; will default to a generic bio.");
  }

  // Character dossiers and portrait prompts.
  const characterRows = extractCharacters(dossiers || {});
  if (characterRows.length === 0) {
    if (!allowDefaults) errors.push("Missing character dossiers (character_dossiers.json has no characters).");
    else warnings.push("No character dossiers found; story will import without character cards.");
  } else {
    for (const c of characterRows) {
      if (!isNonEmptyString(c?.name)) errors.push("A character dossier entry is missing a name.");
      if (!allowDefaults && !isNonEmptyString(c?.portrait_prompt) && !isNonEmptyString(c?.physical_description)) {
        errors.push(`Character "${c?.name || "?"}" missing portrait prompt/physical description (needed for portrait generation).`);
      }
      if (!allowDefaults && !isNonEmptyString(c?.description)) {
        warnings.push(`Character "${c?.name || "?"}" has thin dossier text (description).`);
      }
    }
  }

  // Chapter titles/content sanity.
  for (const ch of chapters || []) {
    if (!Number.isFinite(ch.number) || ch.number <= 0) errors.push("A chapter is missing a valid chapter number.");
    if (!isNonEmptyString(ch.title)) errors.push(`Chapter ${ch.number || "?"} is missing a title.`);
    if (!isNonEmptyString(ch.content)) errors.push(`Chapter ${ch.number || "?"} is missing content.`);
  }

  if (errors.length) {
    const banner = [
      "",
      "Story bundle validation failed. Fix the story directory before uploading.",
      `Story path: ${storyPath}`,
      "",
      "Errors:",
      ...errors.map((e) => `- ${e}`),
    ];
    if (warnings.length) {
      banner.push("", "Warnings:", ...warnings.map((w) => `- ${w}`));
    }
    throw new Error(banner.join("\n"));
  }
  return { warnings, title, authorName, synopsis, genreTags, coverPrompt, authorBio };
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
 * Character rows from character_dossiers.json (v2: characters map, or motivations array).
 * Preserves Romance Factory psychology fields into Cast Gallery `stats` JSONB.
 */
function extractCharacters(dossiers) {
  if (!dossiers || typeof dossiers !== "object") return [];
  const rows = [];

  function buildRow(name, cm) {
    if (!name || !cm || typeof cm !== "object") return null;
    const physical = String(cm.physical_description || "").trim();
    const conscious = String(cm.conscious_want || "").trim();
    const unconscious = String(cm.unconscious_need || "").trim();
    const wound = String(cm.wound || "").trim();
    const fear = String(cm.fear || "").trim();
    const lie = String(cm.lie_they_believe || "").trim();
    const role = String(cm.role || "").trim();

    const secrets = [];
    if (Array.isArray(cm.secrets)) {
      for (const s of cm.secrets) {
        const t = String(s ?? "").trim();
        if (t) secrets.push(t);
      }
    } else if (cm.secret) {
      const t = String(cm.secret).trim();
      if (t) secrets.push(t);
    }

    /** @type {Record<string, unknown>} */
    const stats = {};
    if (conscious) stats.consciousWant = conscious;
    if (unconscious) stats.unconsciousNeed = unconscious;
    if (wound) stats.wound = wound;
    if (fear) stats.fear = fear;
    if (lie) stats.lieTheyBelieve = lie;
    if (role) stats.role = role;

    // Optional vitals if a publish enricher already supplied them
    for (const key of [
      "age",
      "status",
      "height",
      "occupation",
      "zodiacSign",
      "bloodType",
      "birthday",
    ]) {
      if (typeof cm[key] === "string" && cm[key].trim()) stats[key] = cm[key].trim();
    }
    if (cm.stats && typeof cm.stats === "object" && !Array.isArray(cm.stats)) {
      for (const [k, v] of Object.entries(cm.stats)) {
        if (typeof v === "string" && v.trim() && !(k in stats)) stats[k] = v.trim();
        else if (Array.isArray(v) && !(k in stats)) stats[k] = v.map(String);
      }
    }
    if (Array.isArray(cm.favorites) && cm.favorites.length) {
      stats.favorites = cm.favorites.map(String).filter((s) => s.trim());
    }
    if (Array.isArray(cm.dislikes) && cm.dislikes.length) {
      stats.dislikes = cm.dislikes.map(String).filter((s) => s.trim());
    }

    const description =
      String(cm.description || "").trim() || physical || conscious || String(name);

    // Prefer an explicit backstory; otherwise leave null so Cast Gallery shows RF arc fields without duplication
    const backstory = String(cm.backstory || "").trim() || null;

    return {
      name: String(name),
      role,
      portrait_prompt: String(cm.portrait_prompt || "").trim(),
      physical_description: physical,
      secret: secrets[0] || "",
      description,
      backstory,
      stats,
      secrets,
    };
  }

  const chars = dossiers.characters;
  if (chars && typeof chars === "object" && !Array.isArray(chars)) {
    for (const [name, cm] of Object.entries(chars)) {
      const row = buildRow(name, cm);
      if (row) rows.push(row);
    }
    return rows;
  }
  const motivations = dossiers.motivations;
  if (Array.isArray(motivations)) {
    for (const m of motivations) {
      if (!m || typeof m !== "object") continue;
      const row = buildRow(m.name, m);
      if (row) rows.push(row);
    }
  }
  return rows;
}

/**
 * Romance Factory (phase 12) may write ``storyPath/publish_manifest.json`` and
 * ``publish_images/*.webp`` — copy into the app’s static tree instead of Replicate.
 */
function resolvePreGeneratedImageRel(publishManifest, kind, characterName) {
  if (!publishManifest || !publishManifest.images) return null;
  const m = publishManifest.images;
  if (kind === "cover") return m.cover || null;
  if (kind === "author") return m.author || null;
  if (kind === "character" && characterName) {
    const k = "character_" + slug(characterName);
    return m[k] || null;
  }
  return null;
}

async function copyPreGeneratedToPublic(storyPath, relFromStory, destBasename) {
  if (!relFromStory) return null;
  const src = path.join(storyPath, relFromStory);
  let st;
  try {
    st = await fs.stat(src);
  } catch {
    return null;
  }
  if (!st.isFile()) return null;
  const baseName = path.basename(String(destBasename), path.extname(String(destBasename)));
  const savedFilename = `${baseName}.webp`;
  const outPath = path.join(projectRoot, "public", "images", "generated", savedFilename);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.copyFile(src, outPath);
  return `/images/generated/${savedFilename}`;
}

/**
 * @param {object} [extra] — ``{ storyPath, publishManifest, imageKind, characterName }``
 *   imageKind: ``cover`` | ``author`` | ``character``
 */
async function generateImage(
  replicate,
  prompt,
  destBasename,
  aspectRatio = "1:1",
  dryRun,
  extra = {}
) {
  if (dryRun) {
    const base = String(destBasename).replace(/\.webp$/i, "");
    return `/images/generated/${base}.webp`;
  }
  const { storyPath, publishManifest, imageKind, characterName } = extra;
  if (storyPath && publishManifest && imageKind) {
    const rel = resolvePreGeneratedImageRel(publishManifest, imageKind, characterName);
    const copied = await copyPreGeneratedToPublic(storyPath, rel, destBasename);
    if (copied) return copied;
  }
  if (!replicate) {
    return null;
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
  const allowDefaults = Boolean(args["allow-defaults"] || args.allowdefaults);
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

  const prePublishManifest = await readJsonIfExists(path.join(storyPath, "publish_manifest.json"));
  let hasLocalCoverAuthor = false;
  if (prePublishManifest && prePublishManifest.images) {
    const cRel = prePublishManifest.images.cover;
    const aRel = prePublishManifest.images.author;
    if (cRel && aRel) {
      try {
        await Promise.all([fs.access(path.join(storyPath, cRel)), fs.access(path.join(storyPath, aRel))]);
        hasLocalCoverAuthor = true;
      } catch {
        /* incomplete bundle */
      }
    }
  }
  if (!skipImages && !dryRun && !process.env.REPLICATE_API_TOKEN && !hasLocalCoverAuthor) {
    console.error("Missing REPLICATE_API_TOKEN. Add to .env or .env.local, or pass --skip-images");
    console.error("(Pre-generated cover+author in story publish_images/ also satisfies this when publish_manifest.json is present.)");
    process.exit(1);
  }
  if (!skipImages && !dryRun && hasLocalCoverAuthor && !process.env.REPLICATE_API_TOKEN) {
    console.log("Using pre-generated cover/author from Romance Factory publish_images/ (no Replicate).");
  }
  const publishManifest = prePublishManifest;

  const pool = dryRun
    ? null
    : createPool({ connectionString: process.env.POSTGRES_URL });
  const replicate =
    !skipImages && !dryRun && process.env.REPLICATE_API_TOKEN
      ? new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
      : null;

  const storySlug = slug(path.basename(storyPath));

  const [authorProfileRaw, bookCoverRaw, outlineRaw, dossiersRaw, manuscriptMetaRaw, rfProvenance] =
    await Promise.all([
      readJsonIfExists(path.join(storyPath, "author_profile.json")),
      readJsonIfExists(path.join(storyPath, "book_cover.json")),
      readJsonIfExists(path.join(storyPath, "story_outline.json")),
      readJsonIfExists(path.join(storyPath, "character_dossiers.json")),
      readJsonIfExists(path.join(storyPath, "manuscript_metadata.json")),
      loadRfProvenanceDir(storyPath),
    ]);
  const authorProfile = unwrapJsonArtifact(authorProfileRaw);
  const bookCover = unwrapJsonArtifact(bookCoverRaw);
  const outline = unwrapJsonArtifact(outlineRaw);
  const dossiers = unwrapJsonArtifact(dossiersRaw);
  const manuscriptMeta = unwrapJsonArtifact(manuscriptMetaRaw);
  const rfStoryId = resolveRfStoryId({
    provenanceStory: rfProvenance.story,
    publishManifest,
    manuscriptMeta,
  });

  const bcp = bookCover || (manuscriptMeta && manuscriptMeta.book_cover_prompt) || {};
  const storyArc = outline && outline.story_arc ? outline.story_arc : {};
  const chapters = await loadChapters(storyPath);
  const validated = validateStoryBundle({
    storyPath,
    authorProfile,
    bookCover,
    outline,
    dossiers,
    manuscriptMeta,
    chapters,
    allowDefaults,
  });

  const title = validated.title || path.basename(storyPath);
  const synopsis = String(validated.synopsis || "").slice(0, 12000);
  const coverPrompt = String(validated.coverPrompt || "").trim();
  const authorName = String(validated.authorName || "Author").trim();
  const authorBio = String((validated.authorBio || (allowDefaults ? "Romance author." : ""))).slice(0, 8000);
  const authorPortraitPrompt = String(
    (authorProfile && (authorProfile.author_portrait_prompt || authorProfile.author_portrait)) || ""
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

  if (validated.warnings?.length) {
    for (const w of validated.warnings) console.warn(`Warning: ${w}`);
  }

  const characters = extractCharacters(dossiers || {}).slice(0, maxCharacters);

  console.log(`Story: ${title}`);
  console.log(`  Slug: ${storySlug}  Chapters: ${chapters.length}  Characters: ${characters.length}${dryRun ? "  (dry-run)" : ""}`);
  if (rfStoryId) {
    console.log(`  RF story_id: ${rfStoryId}`);
  } else {
    console.log("  RF story_id: (absent — legacy bundle; novels.rf_story_id will be NULL)");
  }
  if (rfProvenance.byChapter.size) {
    console.log(`  Provenance chapters: ${rfProvenance.byChapter.size}`);
  }

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
    if (!skipImages) {
      authorAvatar =
        (await generateImage(
          replicate,
          authorImagePrompt,
          `author-${storySlug}`,
          "2:3",
          dryRun,
          { storyPath, publishManifest, imageKind: "author" }
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
    if (!skipImages) {
      authorAvatar =
        (await generateImage(
          replicate,
          authorImagePrompt,
          `author-${storySlug}`,
          "2:3",
          dryRun,
          { storyPath, publishManifest, imageKind: "author" }
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
  if (!skipImages) {
    coverPath =
      (await generateImage(
        replicate,
        coverImagePrompt,
        `cover-${storySlug}`,
        "3:4",
        dryRun,
        { storyPath, publishManifest, imageKind: "cover" }
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
        (title, series_id, author_id, cover_image_url, synopsis, genre_tags, publication_date, is_featured, featured_order, rf_story_id)
       VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8, $9, $10)
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
        rfStoryId,
      ]
    );
    novelId = nr[0].id;
  }

  for (const ch of chapters) {
    const isFree = ch.number === 1;
    const chapterProvenance = rfProvenance.byChapter.get(ch.number) || null;
    if (dryRun) {
      /* skip */
    } else {
      await pool.query(
        `INSERT INTO chapters (novel_id, chapter_number, title, content, is_free, rf_provenance)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        [
          novelId,
          ch.number,
          ch.title,
          ch.content,
          isFree,
          chapterProvenance ? JSON.stringify(chapterProvenance) : null,
        ]
      );
    }
  }

  for (const c of characters) {
    const portraitHint = c.portrait_prompt
      ? c.portrait_prompt
      : `Romance character portrait, head and shoulders, cinematic. ${c.name}. ${c.physical_description}`.trim();
    const fullPrompt = `No text, no watermarks. ${portraitHint}`;
    let pUrl = "/seed/images/character_portrait_1.png";
    if (!skipImages) {
      pUrl =
        (await generateImage(
          replicate,
          fullPrompt,
          `character-${novelId}-${slug(c.name)}`,
          "1:1",
          dryRun,
          { storyPath, publishManifest, imageKind: "character", characterName: c.name }
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
    rfStoryId,
    provenanceChapters: rfProvenance.byChapter.size,
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
