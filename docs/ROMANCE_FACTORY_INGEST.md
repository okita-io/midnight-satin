# Romance Factory Ingest Contract

This document defines the story-directory contract consumed by [`scripts/import-romance-factory-story.mjs`](../scripts/import-romance-factory-story.mjs). It describes current behavior, including limitations that a future package-and-post workflow must account for.

For the presentation-level acceptance criteria, see [Publishing Requirements](./PUBLISHING_REQUIREMENTS.md). Producer gaps are tracked in [Romance Factory Gaps](./ROMANCE_FACTORY_GAPS.md).

## Ownership boundary

- **Romance Factory** owns novel content, publishing metadata, image prompts, generated images, and the self-contained story directory.
- **Midnight Satin** validates and imports that directory, stores relational content in Neon, places image files in its deployment tree, and presents the book.

The target handoff contains pre-generated assets. Replicate/Recraft generation inside the current importer is a compatibility fallback.

## Run the importer

From the Midnight Satin repository root:

```bash
node scripts/import-romance-factory-story.mjs --story-path /absolute/path/to/story
```

Review the bundle without database or image-provider writes:

```bash
node scripts/import-romance-factory-story.mjs \
  --story-path /absolute/path/to/story \
  --dry-run
```

### Environment

| Variable | Requirement |
|---|---|
| `POSTGRES_URL` | Required for a real import |
| `REPLICATE_API_TOKEN` | Required unless both pre-generated cover and author images are available or `--skip-images` is used |
| `ENV_FILE` / `DOTENV_CONFIG_PATH` | Optional explicit environment file |

The script otherwise loads `.env` and `.env.local` from the Midnight Satin root.

## Story directory

The importer recognizes:

```text
<story>/
├── author_profile.json
├── book_cover.json
├── character_dossiers.json
├── story_outline.json
├── manuscript_metadata.json   # includes story_id (RF-1)
├── publish_manifest.json      # includes story_id (RF-1)
├── provenance/                # RF-2 (optional; new generations)
│   ├── story.json
│   └── chapter_NN.json
├── publish_images/
│   ├── cover.webp
│   ├── author.webp
│   └── character-<slug>.webp
├── chapters/
│   ├── chapter_01.md
│   └── chapter_NN.md
└── manuscript.txt
```

`chapters/chapter_NN.md` is preferred over `manuscript.txt`. `publish_manifest.json` and `publish_images/` are the target asset handoff. `provenance/` is optional for legacy bundles; when present it populates `novels.rf_story_id` and `chapters.rf_provenance` (MS-1).

Romance Factory JSONArtifact envelopes are supported. If a JSON file contains an object in `parsed_data`, the importer uses it. It can also parse a JSON object serialized inside the envelope's `text` field.

## Validation requirements

Without `--allow-defaults`, import fails unless the bundle resolves all of:

- title from `book_cover.json.title` or `story_outline.json.story_arc.title`;
- author name from `book_cover.json.author_name` or `author_profile.json.pen_name` / `name`;
- synopsis from `book_cover.json.back_cover_blurb` or outline `premise` / `logline`;
- at least one genre tag;
- at least one chapter;
- `book_cover.json.cover_image_prompt`;
- author biography from `author_profile.json.biography` / `bio`;
- at least one character dossier;
- a portrait prompt or physical description for each imported character; and
- valid chapter numbers, titles, and non-empty content.

`--allow-defaults` relaxes the cover-prompt, biography, and character requirements and may create a visibly incomplete publication. Use it only for development.

## Metadata mapping

### Author

| Midnight Satin column | Source priority |
|---|---|
| `name` | `book_cover.author_name` → `author_profile.pen_name` → `author_profile.name` |
| `biography` | `author_profile.biography` → `author_profile.bio` |
| `style_tags` | `author_profile.style_tags` → `book_cover.genre_tags` → `story_outline.story_arc.subgenre` → `["Romance"]` |
| `avatar_url` | Local manifest author image → Replicate image → seed placeholder |

Unless `--reuse-author-id` is supplied, the importer inserts a new author.

### Novel

| Midnight Satin column | Source |
|---|---|
| `title` | `book_cover.title` → outline story-arc title |
| `author_id` | New or reused author ID |
| `series_id` | Always `null` in the current importer |
| `cover_image_url` | Local manifest cover → Replicate image → seed placeholder |
| `synopsis` | Back-cover blurb → outline premise → outline logline |
| `genre_tags` | `book_cover.genre_tags` → resolved author style tags |
| `publication_date` | Import date |
| `is_featured` | `--featured` |
| `featured_order` | `--featured-order` |
| `rf_story_id` | `provenance/story.json` → `publish_manifest.story_id` → `manuscript_metadata.story_id` (UUID; null if absent) |

### Chapters

| Midnight Satin column | Source |
|---|---|
| `chapter_number` / `title` / `content` | `chapters/chapter_NN.md` (or `manuscript.txt`) |
| `is_free` | Chapter 1 is free; others paid (current policy) |
| `rf_provenance` | `provenance/chapter_NN.json` normalized to `{ provenance_version, coordinate_space, rubric_version, acts[] }` (null if absent) |

`acts[]` entries carry stitch offsets (`char_start` / `char_end` in `stitched_acts_stripped` space), `card_id`, and machine grades when RF emitted them. Apply migration `scripts/migrations/012_add_rf_provenance.sql` (or a fresh `schema.sql`) before importing bundles that use these columns.

### Characters

The importer accepts either:

- `character_dossiers.characters`, an object keyed by character name; or
- `character_dossiers.motivations`, an array containing `name`.

Current mapping:

| Midnight Satin column | Dossier source |
|---|---|
| `name` | Object key or `name` |
| `role_subtitle` | Title-cased `role` |
| `portrait_url` | Local manifest portrait → Replicate portrait → seed placeholder |
| `description` | `description` → `physical_description` → `conscious_want` |
| `backstory` | Explicit `backstory` only (not synthesized from wound/fear) |
| `stats` | RF psychology fields: `consciousWant`, `unconsciousNeed`, `wound`, `fear`, `lieTheyBelieve`, plus `role`; optional vitals if present |
| `secrets` | `secrets[]` or a one-item array from `secret` |

The importer caps the cast at 12 by default. Cast Gallery renders RF psychology fields as the primary dossier; seed-style vitals remain optional.

## Chapter contract

### Preferred per-chapter files

Files must match `chapters/chapter_<number>.md` and are sorted numerically.

If the first line begins with `#`, the importer removes the Markdown heading marker and stores that line as the chapter title. The remaining text becomes `chapters.content`. Without a heading, the title defaults to `Chapter <number>`.

Despite the `.md` extension, body content must be plain prose:

```text
# Chapter One

First paragraph of prose.

Second paragraph of prose.
```

Do not include Markdown headings, emphasis markers, lists, images, or HTML in the body. The Reading Room renders strings, not Markdown.

### Manuscript fallback

When no matching chapter files exist, the importer splits `manuscript.txt` on:

```text
\n\n---\n\n
```

Each segment becomes a sequential chapter. A leading Markdown heading is handled the same way as a per-chapter file.

### Free chapter behavior

The importer currently sets:

```text
is_free = chapter_number === 1
```

It does not read a free-chapter policy from the manifest.

## Pre-generated image manifest

The importer already understands this minimal shape:

```json
{
  "images": {
    "cover": "publish_images/cover.webp",
    "author": "publish_images/author.webp",
    "character_ada-lovelace": "publish_images/character-ada-lovelace.webp"
  }
}
```

Paths are relative to the story directory.

Character keys are formed as `character_` plus the slugified character name. Slugging:

1. lowercases the name;
2. replaces every run of non-ASCII-alphanumeric characters with `-`;
3. removes leading and trailing hyphens; and
4. truncates to 80 characters.

Examples:

| Character | Manifest key |
|---|---|
| `Ada Lovelace` | `character_ada-lovelace` |
| `Dr. Élodie Marchand` | `character_dr-lodie-marchand` |

The cover and author files must both exist for the importer to treat the bundle as having the minimum local image set. Each character image is resolved independently.

Pre-generated files are copied to `public/images/generated/` and renamed using importer-controlled destinations:

- `author-<story-slug>.webp`;
- `cover-<story-slug>.webp`; and
- `character-<novel-id>-<character-slug>.webp`.

The importer does not inspect the source image's media type; it writes a `.webp` destination. Producers must provide actual WebP data.

## Image fallback behavior

For each image, the importer uses this order:

1. pre-generated path from `publish_manifest.json`;
2. Replicate `recraft-ai/recraft-v4`, when configured; or
3. a seed placeholder.

Generation dimensions requested by the importer are:

- cover: `3:4`;
- author: `2:3`;
- character: `1:1`.

Unless both local cover and author images are present, a real import requires `REPLICATE_API_TOKEN` unless `--skip-images` is set. `--skip-images` uses placeholders and should not be used for a production release.

## Database writes

A successful import inserts, in order:

1. an author, unless an existing author ID is supplied;
2. a novel;
3. all chapters; and
4. up to the configured maximum number of characters.

The operation is not currently wrapped in one transaction and is not idempotent. Re-running it inserts a new novel and new chapters. Use `--dry-run` first and verify the target database.

After processing, the importer writes `<story>/midnightsatin_import.json`:

```json
{
  "storyPath": "/absolute/path/to/story",
  "storySlug": "story-directory-slug",
  "title": "Novel Title",
  "authorId": "uuid",
  "novelId": "uuid",
  "imagePaths": {
    "authorAvatar": "/images/generated/author-story.webp",
    "cover": "/images/generated/cover-story.webp"
  },
  "chapters": 24,
  "characters": 8
}
```

Retain this receipt with the story artifacts. It identifies the imported database records even though the current importer does not yet use it to upsert.

## CLI flags

| Flag | Effect |
|---|---|
| `--story-path <dir>` | Required story directory |
| `--dry-run` | Validate and print planned paths without DB or image-provider calls |
| `--skip-images` | Skip local-copy and Replicate image handling; use placeholders |
| `--no-git` | Do not stage or commit copied/generated static assets |
| `--featured` | Mark the inserted novel featured |
| `--featured-order <n>` | Set featured ordering |
| `--allow-defaults` | Relax strict bundle validation |
| `--max-characters <n>` | Limit imported characters; default `12` |
| `--reuse-author-id <uuid>` / `--author-id <uuid>` | Attach to an existing author |

Without `--no-git`, the script stages generated image files and creates a commit. It does not push that commit.

## Recommended current procedure

1. Confirm the story directory satisfies [Publishing Requirements](./PUBLISHING_REQUIREMENTS.md).
2. Supply actual WebP files and a valid `publish_manifest.json`.
3. Run `--dry-run`.
4. Run the real import with `--no-git` when repository changes must remain operator-controlled.
5. Inspect `midnightsatin_import.json`.
6. Verify the book on Novel Detail, Reading Room, Cast Gallery, and Author Study.
7. Commit and deploy static assets through the normal repository workflow.
