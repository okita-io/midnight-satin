# Romance Factory Handoff Gaps

This is the Midnight Satin consumer-side gap list for the separate Romance Factory finalization and SDXL work. It records what Midnight Satin needs, what the current importer does, and the acceptance criteria for closing each producer or ingest gap.

The exact current importer behavior is documented in [Romance Factory Ingest](./ROMANCE_FACTORY_INGEST.md). The finished-book QA bar is in [Publishing Requirements](./PUBLISHING_REQUIREMENTS.md).

## Priority summary

| Priority | Gap | Primary owner |
|---|---|---|
| P0 | Pre-generated image bundle and manifest | Romance Factory |
| P0 | Plain-text chapter normalization | Romance Factory |
| P0 | Safe, idempotent import | Midnight Satin |
| P1 | Complete Cast Gallery dossiers | Both |
| P1 | Manifest-driven free chapter policy | Both |
| P1 | Production author metadata | Romance Factory |
| P1 | Fail-closed local-image mode | Midnight Satin |
| P2 | Series and launch-news support | Future cross-project work |

## P0 — Pre-generated image bundle

**Affected screens:** Boudoir, Library, Novel Detail, Cast Gallery, Author Study

**Current state:** Romance Factory produces image prompts but not the WebP assets or `publish_manifest.json`. Midnight Satin can fall back to Replicate/Recraft or seed placeholders.

**Target ownership:** Romance Factory generates all publication assets locally with **SDXL** on the mac mini (after ejecting the prose LLM from LM Studio). Midnight Satin only copies and serves them. Replicate is a temporary compatibility fallback, not the production path.

**Required producer output:**

```text
publish_manifest.json
publish_images/
  cover.webp
  author.webp
  character-<slug>.webp
```

**Acceptance criteria:**

- Manifest contains `images.cover`, `images.author`, and one `images.character_<slug>` entry per imported principal character.
- Every relative path exists inside the story directory.
- Files contain actual WebP data.
- Cover is generated at 3:4, author at 2:3, and characters at 1:1.
- Images contain no generated text, watermarks, or inappropriate cropping.
- Import completes without `REPLICATE_API_TOKEN` and all resulting image URLs resolve after deployment.

## P0 — Plain-text chapter normalization

**Affected screen:** Reading Room

**Current state:** Phase 12 chapter files use a `.md` extension. The importer removes only a leading heading; any remaining Markdown is stored and rendered literally.

**Target ownership:** Romance Factory's publish-package stage emits reader-ready plain prose. Midnight Satin remains a simple consumer.

**Acceptance criteria:**

- Every chapter has one title and non-empty prose.
- Body text contains no Markdown headings, emphasis markers, links, image syntax, or HTML.
- Paragraphs are separated by blank lines.
- The chapter count and order match the final manuscript.
- A Reading Room smoke check shows clean paragraphs and no formatting artifacts.

## P0 — Safe, idempotent import

**Affected system:** Neon content records and repeat publication operations

**Current state:** The importer performs sequential `INSERT`s without a wrapping transaction. Re-running it creates duplicate authors/novels or may leave a partial import after failure. `midnightsatin_import.json` records IDs but is not read on subsequent runs.

**Target ownership:** Midnight Satin ingest.

**Acceptance criteria:**

- Database writes run in a transaction.
- Re-import recognizes a stable story identity or the previous `novelId`.
- Operator must explicitly choose update, replace, or create-new behavior.
- A failed import leaves no partial author, novel, chapter, or character set.
- Re-running the same package does not silently duplicate content.

Until this is implemented, operators must run `--dry-run`, inspect the target database, and treat each real import as one-shot.

## P1 — Complete Cast Gallery dossiers

**Affected screens:** Novel Detail Players strip and Cast Gallery

**Current state (after MS alignment):** Cast Gallery renders Romance Factory psychology fields (`consciousWant`, `unconsciousNeed`, `wound`, `fear`, `lieTheyBelieve`). The importer passes those fields through into `stats` JSONB. Zodiac / blood-type vitals are optional seed-only fields and are **not** required from RF.

**Target ownership:**

- Romance Factory emits its native dossier fields (no invented otome stats).
- Midnight Satin preserves and displays them.

**Required character shape (RF → MS):**

```json
{
  "name": "Character Name",
  "role": "protagonist",
  "physical_description": "Reader-facing appearance",
  "portrait_prompt": "Image-generation prompt for SDXL",
  "conscious_want": "...",
  "unconscious_need": "...",
  "wound": "...",
  "fear": "...",
  "lie_they_believe": "...",
  "secret": "Reader-facing secret",
  "secrets": ["optional additional secrets"]
}
```

**Acceptance criteria:**

- Principal cast entries include physical description, portrait prompt, and psychology fields.
- Multiple secrets survive ingest when provided as an array.
- Midnight Satin stores RF fields under camelCase `stats` keys and does not invent zodiac/blood-type data.
- Cast Gallery shows Wants / Needs / Wound / Fear / Lie / Secrets without empty otome rows.

## P1 — Manifest-driven free chapter policy

**Affected screens:** Novel Detail and Reading Room

**Current state:** The importer hardcodes chapter 1 as free. The package cannot express a different sample length.

**Target ownership:**

- Romance Factory records the selected publication policy.
- Midnight Satin validates and applies it.

**Recommended future manifest field:**

```json
{
  "publishing": {
    "free_chapter_numbers": [1]
  }
}
```

**Acceptance criteria:**

- Every imported chapter receives an explicit `is_free` value from a validated policy.
- Missing policy uses the documented `[1]` default.
- Invalid or out-of-range chapter numbers fail validation.
- Novel Detail lock icons and Reading Room access match the manifest.

This field is a proposed extension; the current importer does not read it.

## P1 — Production author metadata

**Affected screen:** Author Study

**Current state:** Author name and portrait prompt are usually available, but biography and `style_tags` may be missing or generic. `--allow-defaults` can insert “Romance author.”

**Target ownership:** Romance Factory finalization.

**Acceptance criteria:**

- `author_profile.json` has a stable pen name, non-generic biography, and meaningful `style_tags`.
- Author portrait prompt describes a consistent fictional author identity.
- Repeated books by the same pen name use an existing Midnight Satin author ID.
- Author Study has no placeholder portrait or biography.

## P1 — Fail-closed local-image mode

**Affected system:** Import validation and asset quality

**Current state:** Missing local character images can silently fall through to Replicate or seed placeholders. Local cover and author presence controls whether an API token is required, but does not prove the entire image set is complete.

**Target ownership:** Midnight Satin ingest.

**Proposed behavior:** Add a `--require-local-images` mode for production imports.

**Acceptance criteria:**

- Import validates cover, author, and every expected character image before database writes.
- Missing, unreadable, or non-WebP files stop the import with a path-specific error.
- Production imports cannot silently use placeholders.
- Replicate remains available only as an explicit legacy/development mode.

## P2 — Series metadata

**Affected screen:** Author Study bibliography

**Current state:** Midnight Satin supports `series`, but the importer always inserts `series_id = null`. Romance Factory's current package has no agreed series contract.

**Decision for v1:** Standalone novels are valid. Do not invent series data during import.

**Future acceptance criteria:**

- A stable series identity, title, description, genre tags, completion state, and book ordering contract is defined.
- Existing series can be reused without duplicates.
- Author bibliography groups and orders the novels correctly.

## P2 — Launch news

**Affected screens:** Boudoir “The Latest” and `/updates`

**Current state:** `news_articles` exists, but the Romance Factory importer and MCP publishing tools do not create launch articles.

**Decision for v1:** Novel publication does not automatically create news.

**Future acceptance criteria:**

- Editorially approved launch copy has a separate schema and workflow.
- Automated posting can create or update a unique article slug.
- Hero assets and attribution are explicit.
- A failed news post cannot roll back or duplicate an otherwise successful novel import.

## Additional Midnight Satin follow-ups

These are consumer-side improvements and should not block SDXL installation:

1. ~~Preserve incoming character psychology fields into `stats`~~ (done — Cast Gallery + importer aligned to RF).
2. Add preflight validation that reports all missing files and fields at once.
3. Add `--require-local-images`.
4. Read a manifest free-chapter policy.
5. Wrap database writes in a transaction.
6. Add explicit upsert/re-import semantics.
7. Include imported character image paths in `midnightsatin_import.json`.
8. Separate asset staging/commit from content import; never commit unless the operator requests it.

## Handoff checklist for the Romance Factory session

The parallel Romance Factory work can treat this as its consumer contract:

- [ ] Emit normalized chapters accepted by [Romance Factory Ingest](./ROMANCE_FACTORY_INGEST.md).
- [ ] Generate the complete WebP image set.
- [ ] Emit the existing minimal `publish_manifest.json` image mapping.
- [ ] Enrich author metadata and character dossiers before unloading the prose model.
- [ ] Validate the package against [Publishing Requirements](./PUBLISHING_REQUIREMENTS.md).
- [ ] Preserve all artifacts and the returned `midnightsatin_import.json` receipt.

The later Romance Factory package-and-post documentation should link to these Midnight Satin documents rather than duplicate the consumer requirements.
