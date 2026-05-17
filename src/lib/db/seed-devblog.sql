-- Seed: Romance Factory developer blog post #1
-- Article type: editorial (developer post-mortem)
-- Body stored as markdown — rendered by react-markdown on the detail page

INSERT INTO news_articles (
  title,
  slug,
  article_type,
  hero_image_url,
  summary,
  body_content,
  tags,
  attribution,
  source_url,
  source_platform,
  is_published,
  is_featured,
  featured_order,
  published_at
) VALUES (
  'Building Romance Factory: 503 Commits to an Autonomous Fiction Engine',
  'building-romance-factory-503-commits',
  'editorial',
  NULL,
  'A developer post-mortem on building an agentic AI novel pipeline from scratch — what we shipped, what broke, and what we learned across 57 days and 503 commits.',
  $body$## March 18 — Day One: Genre, Characters, Chapters

Two months ago I made an initial commit to a repo called `romance-factory`. At the time it was a script that could call an LLM and write a chapter. Today it''s a 12-phase autonomous pipeline that designs, writes, self-edits, and publishes romance novels end-to-end — running 24/7 on a local GPU without me in the loop. This is the story of how it got there.

The initial commit was bare — a working skeleton that could hit an LLM and get prose back. Within the first day that became something more interesting.

The first real feature was genre-specific generation — author profiles that understood the difference between paranormal romance and contemporary. Not just a genre label injected into a prompt, but a proper `author_profile` structure with genre themes, atmospheres, and trope awareness that flowed into every downstream call.

The same day: act-based chapter writing with a character web. Instead of generating a chapter in one big call, the pipeline broke it into acts, each aware of the characters present, their emotional state, and their relationship status. A `chapter_editor` with editorial rules and romance alignment checks followed immediately after.

Manuscript management came in that first batch too — incremental saving so a crash mid-generation didn't lose everything. Chapters written to disk the moment they completed, with metadata tracking progress. On a 12B local LLM doing 35 tokens/second, a full novel takes 14+ hours. Losing half of that to a crash is not acceptable.

---

## March 19 — The Anti-Slop Problem

Three days in and we''d already identified what I consider the fundamental problem with LLM-generated fiction: **mechanical prose patterns that signal AI authorship**.

The solution was a dedicated `anti_slop.py` detection module. This wasn''t just a list of banned phrases — it was a scoring system that detected the statistical signature of AI-generated prose: overuse of emotional clichés ("his eyes darkened"), lazy body-language tells ("she felt a shiver run down her spine"), and the particular flatness of AI narrative voice when it runs out of ideas and starts explaining itself.

The same day: an adversarial tightening pass. After an act was drafted, a second LLM call specifically targeted redundancy and over-explanation — the two failure modes that make AI fiction unreadable at any length.

We also added `foreshadowing_audit.py` — a post-generation check that compared what the outline *planted* against what the manuscript actually *paid off*. Unresolved foreshadowing is one of the harder structural problems in long-form generation, and catching it at the end of a 60,000-word run is better than not catching it at all.

---

## March 20 — Quality Stack and the `--short-story` Flag

The quality stack was accumulating fast. A `--short-story` flag gave us a 5-chapter, 5k-word smoke test — critical for iterating on the pipeline without waiting 14 hours to find out a prompt change broke the outline. The `--light` flag skipped post-processing passes for the same reason.

The more significant additions: a reader panel (simulated reader feedback), an integrated revision pass that used reader panel and foreshadowing audit results to target rewrites at specific chapters, and an `editorial_changelog_strip` function to remove the meta-commentary that LLMs love to leave in prose ("I''ve revised this section to better reflect..."). That last one sounds trivial. It is not trivial. Every model does this and it destroys immersion.

We also introduced `manuscript_editing_sweep.py` — a final pass using regex and a lightweight LLM call to catch any editing artifacts that slipped through into the final output.

---

## March 21-22 — Training Infrastructure and Modular Config

The first architectural pivot: rather than just generating stories, we wanted to train models on the output. Submodules for `autotrain-advanced` and `autoresearch` were added, along with a browser harness for corpus collection using Chrome DevTools MCP — letting an LLM-controlled browser collect properly licensed training material at scale.

Config was refactored from inline strings to YAML-loaded prompt files. Prompts became standalone documents. Anti-patterns, romance rules, and fiction identity guidelines lived in markdown files rather than hardcoded Python strings. This was the right call — it meant prompts could be iterated without touching code, and different story types could use different prompt sets.

---

## March 23-25 — Two-Pass Editing, Repetition Detection, Cliffhangers

The editing loop got serious. A two-pass system: a fast first pass for obvious issues, a second full pass for rewrites. Fuzzy matching for near-repeated passages — catching the AI''s tendency to repeat not just identical phrases but *semantically equivalent* constructions across acts.

Mechanical repetition scanning. Cliffhanger bundles — author profiles now carried a `cliffhanger_tendency` field that shaped how acts ended. The same day we switched from Ollama to LM Studio as the primary local backend, which brought better streaming support and more stable concurrent model loading.

---

## March 28 — The V2 Decision

March 28 is the most significant date in this project''s history. Four commits that changed everything:

1. **Mojibake repair and truncation recovery** — local LLMs, especially under load, produce broken unicode and truncated JSON. A repair layer was added to `ollama_client.py` that detected and fixed both before the response ever reached the pipeline.

2. **OpenRouter as a first-class backend** — cloud models via a single API, switchable per role. The generator could use Claude Opus for quality, the editorial pass could use Gemini for speed, all routed through OpenRouter without changing pipeline code.

3. **4-phase architecture with interactive interviews** — the pipeline now started by *interviewing itself* about the story before writing a word. Author profile, world, characters, outline — each generated and reviewed before prose began.

4. **LLM response continuation** — when a local model truncates mid-output (a frequent occurrence under memory pressure), the client detects the truncation and issues a continuation prompt transparently.

That last one deserves emphasis. Running a 12B model on a consumer GPU for 14 hours means you will hit memory pressure. The truncation recovery system meant the pipeline could run unattended without producing broken JSON artifacts that would crash downstream stages.

---

## April 5 — LanceDB RAG Pipeline V2

The biggest single day of commits. The LanceDB RAG pipeline v2 went in as a single session:

- **LanceDB** replacing flat JSON as the retrieval layer — every artifact (author profile, world, characters, outline beats, generated acts, editorial feedback) stored as vector embeddings
- **Multi-agent architecture** — writer, editorial, and rewrite agents each with their own retrieval context
- **Two-call act generation** — prose-only first call, then metadata extraction (summary, emotional tone, plot function, characters involved, foreshadowing planted)

Why two calls? Because asking one LLM call to produce both quality prose *and* structured JSON metadata produces mediocre prose. The model splits its attention. Separating them got better output from both.

The metadata extraction was the key unlock for everything that followed. Once every act had structured annotations — emotional arc, plot function, romance progression — we could query across the entire draft intelligently.

---

## April 6-8 — Phrase Detection, Portrait Generation, Conflict Catalog

With the RAG layer in place, refinements came quickly:

**Repeated phrase detection** — a variation pipeline that identified phrases appearing too frequently across acts and generated rewrite suggestions for them. Not just exact matches, but semantic clusters using the embedding space.

**Portrait and cover generation** — author portraits, character portraits, and book cover generation integrated into the pipeline. Every story now had a visual identity alongside the manuscript.

**External conflict mechanics** — a conflict catalog system. Rather than the generator inventing a conflict from scratch each time, it selected from a structured set of conflict archetypes (professional rivalry, secret past, forced proximity, etc.) and instantiated them with story-specific details. More consistent story structure, less generic plotting.

**Irreversible plot progression enforcement** — a system that tracked which story beats had been *committed to* and prevented the generator from retreating to earlier states. Without this, LLMs tend to loop: something happens, then the characters act as if it didn''t happen, then it happens again.

---

## April 9-10 — The World-Building System (26 PRs in One Day)

April 9 was the world-building PR avalanche: 26 pull requests merged in a single day, most of them agent branches building out the world system with full property-test coverage.

The core feature: a `--world` CLI flag that selected a world archetype (contemporary, paranormal, sci-fi, historical, etc.), generating a `world.json` artifact that was then injected into every downstream stage — characters, outline, conflict, and act generation all received world context.

The Hypothesis property tests that came with this were extensive. World artifact schema validation, world context propagation through the pipeline, hybrid world seed construction with archetype blending. The test suite effectively documented the entire world system as executable specifications.

April 10 also brought the **Verbosity Engine** — a pacing control system that varied narrative density across acts. Not every act should move at the same speed; establishing scenes need more environmental texture, climax scenes need shorter sentences and more white space. The verbosity engine gave the generator explicit pacing targets per act.

---

## April 11-15 — The Intimacy Mechanics System

For a romance fiction generator, this was the feature that mattered most: a structured system for managing physical and emotional intimacy across the narrative.

The additions across this week:
- `love_scene_intimacy_mechanics.py` — a playbook for escalating intimacy sequences
- Heat level taxonomy: sweet, mild, moderate, steamy, dark, explicit, erotic — each with different generation parameters and prompt guidance
- Romance focus levels per act — how much narrative emphasis to place on the romantic relationship vs plot
- Intimacy beat scheduling — the pipeline now placed intimacy beats at structurally appropriate points in the outline rather than generating them ad-hoc

The `outline_editorial.py` module tracked intimacy milestones across the story and flagged regressions — situations where the intimacy level of an act was lower than what had already been established. This is the romance equivalent of a continuity error.

---

## April 17-18 — The Surgical Editor (63 PRs)

The most complex engineering effort in the project. The surgical editor is a deterministic text manipulation layer that sits *below* the LLM rewrite loop — making targeted, provably correct changes to specific segments of prose before escalating to a full LLM rewrite.

Built across 63 pull requests merged over two days, all with Hypothesis property tests.

**The architecture:**
- Paragraph segmentation with stable segment IDs
- Operations: `replace_text`, `delete_span`, `insert_before`, `insert_after`, `rewrite_span`, `split_segment`, `merge_segments`
- Anchor resolution — operations can target text anchors rather than requiring exact segment IDs
- Transactional rollback — if a batch of operations produces invalid output, the whole batch reverts
- Per-act blast radius limits — no single surgical session can touch more than N% of an act''s content
- LanceDB sync after every save — surgical edits immediately reflected in the retrieval layer

**The three-tier planning strategy:**
1. **Tier 1 (Lexicon)** — deterministic fixes: clichés on a known list, mechanical repetitions, specific banned phrases
2. **Tier 2 (LLM Planner)** — the LLM generates a structured patch plan describing *what to change* without writing the replacement prose itself
3. **Tier 3 (LLM Verifier)** — a second LLM call verifies the planned operations won''t break coherence before applying them

The surgical editor runs before full-act LLM rewrites in Phase 10. For many issues, a surgical fix is sufficient — no need for the expense and unpredictability of a full rewrite.

---

## April 20-23 — Character Archetypes and Progressive Disclosure

Character archetypes as structured JSON — each archetype defining personality traits, dialogue patterns, emotional responses, and critically: **unlock conditions**. The female lead''s archetype determined not just how she spoke in early acts, but what emotional interactions were *available* to her at each stage of the romance arc.

The ROM-M (Romance Milestone Mechanics) system tracked character relationship milestones — first acknowledgment of attraction, first physical contact, first vulnerability, first intimate encounter — and enforced that they occurred in the right order.

**Progressive context disclosure** was the companion system: early acts received only world and basic character context. The leads'' full emotional profiles and romance staging were phased in gradually as the narrative warranted. This prevented the generator from writing the leads as if they were already deeply intimate in chapter two.

---

## April 24-26 — Publishing and Cross-Story Character Management

The pipeline got a publishing endpoint: `publish_to_midnight_satin.py` — a script that packaged a completed manuscript and metadata for import directly into the reader app.

**SymSpell-based glued words repair** — when local LLMs run at high throughput, they sometimes produce run-together words ("shewanted" instead of "she wanted"). SymSpell gives us a fast dictionary-based split detector with custom name support so character names don''t get split.

**Character collections** — a cross-story character registry. Once a character appeared in a published story, their profile was stored in a shared collection. New stories could query the collection to avoid reusing names or character profiles that were already established in the reader''s universe.

---

## May 2-10 — Stability, TTS, and Deduplication

A consolidation period. The main additions:

**LanceDB like-kind prose de-duplication** — before writing an act, the pipeline retrieved the N most similar acts already written and explicitly provided them as negative examples ("don''t write something that reads like this"). This addressed the drift problem: over a 20-chapter novel, the generator''s default patterns assert themselves and acts start to feel repetitive.

**VoxCPM TTS integration** — text-to-speech with voice consistency tracking. The pipeline could export an audiobook version of the completed manuscript, with different voice profiles for narration vs. character dialogue.

**Phase 10 rewrite cap and plateau exit logic** — the editorial loop would previously run indefinitely trying to improve acts that had reached a quality ceiling. A plateau detector now identified when three consecutive rewrites weren''t improving the score and exited the loop, saving significant compute.

**JSON repair for near-valid LLM outputs** — local models under memory pressure sometimes produce subtly malformed JSON. A repair module applied heuristic fixes before falling back to a full retry.

---

## May 11-16 — Meso Scale, ROM-M Repair, and Motif Detection

The final push before this writing:

**Phase 10 queue-state persistence** — the editorial rewrite phase now checkpointed its work queue to disk. A crash mid-Phase-10 (not uncommon on a 14-hour run) no longer required starting the editorial pass from scratch.

**Meso-scale editorial rubric and scene continuity ledger** — a second editorial layer that evaluated acts not in isolation but relative to their neighbors. Did the scene entry rhythm vary? Was location prose repeated in adjacent acts? Did the emotional register of consecutive acts make sense as a sequence?

**ROM-M monotonicity repair** — a deterministic module that enforced that romance milestone scores could only increase across the story. If act 15 had a lower intimacy milestone score than act 12, the repair module flagged the regression and queued a targeted rewrite.

**Romance Prompt Engineer (RPE)** — a dedicated prompt generation subsystem for love scenes. Rather than the act generation agent writing a generic intimacy prompt from the beat description, the RPE constructed a bespoke prompt with precise escalation targets, body language guidance, and dialogue tone calibration.

---

## What the Architecture Looks Like Now

```
Phase 1:  Initialize LanceDB collections
Phase 2:  Generate author profile → embed → store
Phase 3:  Generate world artifact → embed → store
Phase 4:  Generate character web → per-character profiles
Phase 5:  Generate story outline → chapter + act outlines
Phase 6:  Outline editorial review → repair problematic beats
Phase 7:  Rough draft → generate acts sequentially, checkpoint per act
Phase 8:  Assemble chapters
Phase 9:  Score every act (RAG context + 16-rule rubric)
Phase 10: Rewrite weakest acts → surgical tier → LLM rewrite → plateau exit
Phase 11: Final assembly → manuscript.txt
Phase 12: Generate character canon from finished novel
```

Eight LanceDB collections. Three LLM roles (generator, editorial, rewrite — all local, all running on a 3090). Sixteen rubric rules across five categories. A surgical editing layer with three tiers of planning. A meso-scale continuity ledger. Progressive context disclosure across 20+ chapters.

---

## What We Got Wrong

**Flat JSON was a mistake from day one.** The first month used flat JSON files as the persistence layer. When you need to retrieve "the three most emotionally similar acts to act 14" or "all acts where character X has dialogue," flat JSON makes you load the entire story into memory and scan it. Migrating to LanceDB was the right call but it was also a significant refactor.

**The editorial loop needed exit conditions earlier.** For weeks the Phase 10 rewrite loop ran until it hit a score threshold or a maximum iteration count. The plateau detector should have been built in week two, not month two. We wasted significant compute on rewrites that weren''t improving quality.

**Prompt modularity saved us constantly.** Every time we found a new failure mode — a new cliché pattern, a new type of structural repetition, a new way the generator tried to exit the romance arc early — we could fix it in a prompt file without touching pipeline code. This was the best early architectural decision.

---

## What''s Next

The gap that matters most right now is prose craft at the sentence level. The pipeline is good at structure — it can construct a coherent 60,000-word narrative with a working romance arc and consistent characters. It is less good at the moment-to-moment quality of individual sentences: rhythm, free indirect discourse, point of view management, the specific texture that makes prose feel like it was written by a human author with a distinct voice.

That''s the problem we''re working on next, with a fine-tuned local editorial model trained on *Style in Fiction* (Leech & Short) — a Qwen3-8B model that can evaluate prose against a real academic framework for sentence-level craft and provide structured feedback that maps directly into the existing editorial pipeline.

More on that in the next post.$body$,
  ARRAY['Developer Blog', 'Behind the Scenes', 'AI Fiction', 'Romance Factory'],
  'From the Editor',
  NULL,
  NULL,
  true,
  true,
  3,
  '2026-05-16 00:00:00+00'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  article_type = EXCLUDED.article_type,
  hero_image_url = EXCLUDED.hero_image_url,
  summary = EXCLUDED.summary,
  body_content = EXCLUDED.body_content,
  tags = EXCLUDED.tags,
  attribution = EXCLUDED.attribution,
  source_url = EXCLUDED.source_url,
  source_platform = EXCLUDED.source_platform,
  is_published = EXCLUDED.is_published,
  is_featured = EXCLUDED.is_featured,
  featured_order = EXCLUDED.featured_order,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();
