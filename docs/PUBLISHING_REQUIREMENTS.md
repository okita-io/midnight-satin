# Publishing Requirements

This document defines the content and assets required for a complete novel experience in Midnight Satin. It is the consumer-side contract for content produced by Romance Factory.

Database columns are defined in [`src/lib/db/schema.sql`](../src/lib/db/schema.sql). The requirements below are stricter than database nullability where the UI needs populated content to present a finished book.

## Publication-ready checklist

A novel is ready to publish when it has:

- one complete author profile;
- one novel row with a cover, synopsis, and genre tags;
- one or more uniquely numbered chapters with plain-text prose;
- character records and portraits for the principal cast;
- valid local or hosted URLs for every required image;
- a deliberate free-chapter policy; and
- a successful visual check of Novel Detail, Reading Room, Cast Gallery, and Author Study.

## Author

Database table: `author_profiles`

| Field | Launch requirement | Presentation use |
|---|---|---|
| `name` | Required | Novel byline and Author Study title |
| `avatar_url` | Required | Author Study portrait |
| `biography` | Required and non-empty | Author Study biography |
| `style_tags` | Required; at least one meaningful tag | Author Study style labels |
| `follower_count` | May use database default `0` | Author follow count |

The author portrait should be generated at **2:3** in WebP format. Keep the face and identifying features centered so the image survives the Author Study's shaped crop.

If a novel belongs to an existing pen name, the ingest process should reuse that author record rather than create a duplicate.

## Novel

Database table: `novels`

| Field | Launch requirement | Presentation use |
|---|---|---|
| `title` | Required | All book surfaces |
| `author_id` | Required and valid | Byline and Author Study relationship |
| `cover_image_url` | Required | Boudoir, Library, Novel Detail, bibliography |
| `synopsis` | Required and non-empty | Novel Detail and library previews |
| `genre_tags` | Required; at least one | Discovery and metadata |
| `publication_date` | Required for a finished release | Publication metadata |
| `series_id` | Required only for a series title | Author bibliography grouping |
| `is_featured` | Editorial decision; defaults to `false` | Boudoir featured placement |
| `featured_order` | Required when ordering multiple featured titles | Featured ordering |
| `rating`, `rating_count` | Use defaults until readers submit reviews | Rating presentation |

Generate cover art at **3:4** in WebP format, with the important subject matter inside a central safe area. Some components crop covers closer to **2:3**. Cover art should contain no generated typography; Midnight Satin renders title and author text in the interface.

## Chapters

Database table: `chapters`

Every chapter requires:

- a positive `chapter_number`;
- a title;
- non-empty `content`;
- an explicit `is_free` value; and
- a unique `(novel_id, chapter_number)` pair.

Chapter content is **plain text**, not Markdown or HTML. Separate paragraphs with one or more blank lines (`\n\n`). The Reading Room splits content on blank lines and renders the resulting strings as prose. Markdown markers left in a chapter will be displayed literally.

For locked chapters, Midnight Satin sends only the first five paragraphs plus an eight-paragraph blurred teaser to the client. Paragraph boundaries therefore affect both reading typography and the locked preview.

The current Romance Factory importer marks chapter 1 free and all later chapters locked. Treat this as the current default, not a permanent publishing policy.

## Characters

Database table: `characters`

### Minimum for Novel Detail

The Players strip needs:

- `name`;
- `role_subtitle`; and
- `portrait_url`.

### Complete Cast Gallery dossier

A publication-quality character should also have:

- `description` (typically the physical description);
- optional `backstory` (longer background when authored);
- `secrets[]`; and
- a `stats` JSON object.

**Romance Factory novels** use psychology fields in `stats` (primary Cast Gallery layout):

```json
{
  "consciousWant": "string",
  "unconsciousNeed": "string",
  "wound": "string",
  "fear": "string",
  "lieTheyBelieve": "string",
  "role": "protagonist"
}
```

**Hand-authored / seed novels** may still use optional vitals:

```json
{
  "age": "string",
  "status": "string",
  "height": "string",
  "occupation": "string",
  "zodiacSign": "string",
  "bloodType": "string",
  "birthday": "string",
  "favorites": ["string"],
  "dislikes": ["string"]
}
```

Midnight Satin renders whichever keys are present. Do not invent zodiac/blood-type fields for RF-generated cast.

`endorsement_count` and `has_trophy` may retain their database defaults on first publication.

Generate character portraits at **1:1** in WebP format. Use a centered head-and-shoulders composition with enough surrounding detail to support circular preview crops and taller Cast Gallery crops.

## Asset storage

Midnight Satin has no separate image table. Image locations are stored directly on content records:

- `author_profiles.avatar_url`;
- `novels.cover_image_url`;
- `characters.portrait_url`; and
- `news_articles.hero_image_url`.

The current Romance Factory importer copies pre-generated assets into:

```text
public/images/generated/
```

and stores URLs such as `/images/generated/cover-my-story.webp`. Vercel Blob helpers exist elsewhere in the app, but the current novel ingest path uses static files.

All imported production assets should:

- be valid WebP files;
- use stable, slug-based names;
- contain no watermarks;
- resolve from their stored URL after deployment; and
- have sufficient resolution for their largest presentation surface.

## Screen-level QA

### Boudoir and Library

- Cover loads without distortion.
- Title, author, and genre metadata are present.
- Featured placement matches the editorial flags.

### Novel Detail

- Cover remains legible through the hero crop.
- Synopsis, author byline, genre tags, chapter list, and Players strip are populated.
- Start Reading opens the first chapter.
- Free and locked chapter states match the publication policy.

### Reading Room

- Chapter title and number are correct.
- Prose has clean paragraph breaks with no visible Markdown.
- The first paragraph and ornamental layout render correctly.
- Locked chapters reveal only the intended preview and teaser.

### Cast Gallery

- Every principal character has a distinct portrait.
- Role, description, psychology fields (Wants / Needs / Wound / Fear / Lie), and secrets map to the correct character.
- Optional seed vitals (age, zodiac, etc.) appear only when authored.
- Portrait crops do not cut off faces.

### Author Study

- Portrait, biography, and style tags are populated.
- The novel appears in the correct author bibliography.
- Series grouping is correct when a series is supplied.

## Not required for the first publishing bridge

The first Romance Factory handoff does not need to create:

- a `series` record for standalone novels;
- a launch `news_articles` record;
- ratings or reader reviews;
- endorsements, comments, bookmarks, or reading progress; or
- paperback order data.

Those are editorial, commerce, or reader-generated concerns rather than required novel-package content.
