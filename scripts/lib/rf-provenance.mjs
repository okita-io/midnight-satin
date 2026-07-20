/**
 * Romance Factory provenance helpers (MS-1).
 * Pure loaders for provenance/ + story_id resolution — no DB side effects.
 */

import { promises as fs } from "fs";
import path from "path";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readJsonIfExists(filePath) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeStoryId(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!UUID_RE.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

/**
 * Resolve rf_story_id from RF bundle artifacts (first match wins).
 * @param {{
 *   provenanceStory?: Record<string, unknown> | null,
 *   publishManifest?: Record<string, unknown> | null,
 *   manuscriptMeta?: Record<string, unknown> | null,
 * }} sources
 * @returns {string | null}
 */
export function resolveRfStoryId(sources) {
  const candidates = [
    sources.provenanceStory?.story_id,
    sources.publishManifest?.story_id,
    sources.manuscriptMeta?.story_id,
  ];
  for (const raw of candidates) {
    const id = normalizeStoryId(raw);
    if (id) return id;
  }
  return null;
}

/**
 * Normalize a chapter provenance file into the JSONB shape stored on chapters.rf_provenance.
 * @param {Record<string, unknown> | null | undefined} chapterPayload
 * @param {number} chapterNumber
 * @returns {Record<string, unknown> | null}
 */
export function normalizeChapterProvenance(chapterPayload, chapterNumber) {
  if (!chapterPayload || typeof chapterPayload !== "object") return null;
  const actsRaw = chapterPayload.acts;
  if (!Array.isArray(actsRaw) || actsRaw.length === 0) return null;

  const acts = [];
  for (const act of actsRaw) {
    if (!act || typeof act !== "object") continue;
    const actNumber = Number(act.act_number);
    const charStart = Number(act.char_start);
    const charEnd = Number(act.char_end);
    if (!Number.isFinite(actNumber) || actNumber <= 0) continue;
    if (!Number.isFinite(charStart) || !Number.isFinite(charEnd)) continue;
    acts.push({
      act_number: actNumber,
      char_start: charStart,
      char_end: charEnd,
      card_id: typeof act.card_id === "string" ? act.card_id : null,
      writer_adapter:
        typeof act.writer_adapter === "string" ? act.writer_adapter : null,
      base_version: typeof act.base_version === "string" ? act.base_version : null,
      adapter_version:
        typeof act.adapter_version === "string" ? act.adapter_version : null,
      editor_version:
        typeof act.editor_version === "string" ? act.editor_version : null,
      judge_version:
        typeof act.judge_version === "string" ? act.judge_version : null,
      editor_card_hit:
        act.editor_card_hit == null || Number.isNaN(Number(act.editor_card_hit))
          ? null
          : Number(act.editor_card_hit),
      judge_score:
        act.judge_score == null || Number.isNaN(Number(act.judge_score))
          ? null
          : Number(act.judge_score),
      revisions:
        act.revisions == null || Number.isNaN(Number(act.revisions))
          ? null
          : Number(act.revisions),
      card: act.card && typeof act.card === "object" ? act.card : null,
    });
  }
  if (!acts.length) return null;

  return {
    provenance_version:
      typeof chapterPayload.provenance_version === "string"
        ? chapterPayload.provenance_version
        : "1.0",
    chapter_number: chapterNumber,
    coordinate_space:
      typeof chapterPayload.coordinate_space === "string"
        ? chapterPayload.coordinate_space
        : "stitched_acts_stripped",
    rubric_version:
      typeof chapterPayload.rubric_version === "string"
        ? chapterPayload.rubric_version
        : null,
    acts,
  };
}

/**
 * Build a chapter_number → rf_provenance map from loaded provenance JSON files.
 * @param {Map<number, Record<string, unknown>> | Record<string, Record<string, unknown>>} byChapter
 * @returns {Map<number, Record<string, unknown>>}
 */
export function buildChapterProvenanceMap(byChapter) {
  /** @type {Map<number, Record<string, unknown>>} */
  const out = new Map();
  const entries =
    byChapter instanceof Map
      ? byChapter.entries()
      : Object.entries(byChapter).map(([k, v]) => [Number(k), v]);

  for (const [key, payload] of entries) {
    const chapterNumber = Number(
      payload?.chapter_number != null ? payload.chapter_number : key
    );
    if (!Number.isFinite(chapterNumber) || chapterNumber <= 0) continue;
    const normalized = normalizeChapterProvenance(payload, chapterNumber);
    if (normalized) out.set(chapterNumber, normalized);
  }
  return out;
}

/**
 * Load RF provenance/ from a story directory.
 * @param {string} storyPath
 * @returns {Promise<{
 *   story: Record<string, unknown> | null,
 *   byChapter: Map<number, Record<string, unknown>>,
 * }>}
 */
export async function loadRfProvenanceDir(storyPath) {
  const provDir = path.join(storyPath, "provenance");
  const story = await readJsonIfExists(path.join(provDir, "story.json"));

  /** @type {Map<number, Record<string, unknown>>} */
  const rawByChapter = new Map();
  let entries = [];
  try {
    entries = await fs.readdir(provDir);
  } catch {
    return { story, byChapter: new Map() };
  }

  for (const name of entries) {
    const match = /^chapter_(\d+)\.json$/i.exec(name);
    if (!match) continue;
    const chapterNumber = Number(match[1]);
    const payload = await readJsonIfExists(path.join(provDir, name));
    if (payload) rawByChapter.set(chapterNumber, payload);
  }

  return {
    story,
    byChapter: buildChapterProvenanceMap(rawByChapter),
  };
}
