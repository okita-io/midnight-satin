import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildChapterProvenanceMap,
  loadRfProvenanceDir,
  normalizeChapterProvenance,
  normalizeStoryId,
  resolveRfStoryId,
} from "../../scripts/lib/rf-provenance.mjs";

describe("normalizeStoryId", () => {
  it("accepts canonical UUIDs and lowercases them", () => {
    expect(normalizeStoryId("AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA")).toBe(
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
    );
  });

  it("rejects non-UUIDs", () => {
    expect(normalizeStoryId("not-a-uuid")).toBeNull();
    expect(normalizeStoryId("")).toBeNull();
    expect(normalizeStoryId(null)).toBeNull();
  });
});

describe("resolveRfStoryId", () => {
  it("prefers provenance/story.json over publish_manifest and manuscript_metadata", () => {
    expect(
      resolveRfStoryId({
        provenanceStory: { story_id: "11111111-1111-4111-8111-111111111111" },
        publishManifest: { story_id: "22222222-2222-4222-8222-222222222222" },
        manuscriptMeta: { story_id: "33333333-3333-4333-8333-333333333333" },
      })
    ).toBe("11111111-1111-4111-8111-111111111111");
  });

  it("falls back through publish_manifest then manuscript_metadata", () => {
    expect(
      resolveRfStoryId({
        provenanceStory: null,
        publishManifest: { story_id: "22222222-2222-4222-8222-222222222222" },
        manuscriptMeta: { story_id: "33333333-3333-4333-8333-333333333333" },
      })
    ).toBe("22222222-2222-4222-8222-222222222222");

    expect(
      resolveRfStoryId({
        provenanceStory: null,
        publishManifest: { images: {} },
        manuscriptMeta: { story_id: "33333333-3333-4333-8333-333333333333" },
      })
    ).toBe("33333333-3333-4333-8333-333333333333");
  });

  it("returns null for legacy bundles without story_id", () => {
    expect(
      resolveRfStoryId({
        provenanceStory: null,
        publishManifest: { images: {} },
        manuscriptMeta: { word_count: 12 },
      })
    ).toBeNull();
  });
});

describe("normalizeChapterProvenance", () => {
  it("keeps act stitch offsets and grades", () => {
    const normalized = normalizeChapterProvenance(
      {
        provenance_version: "1.0",
        coordinate_space: "stitched_acts_stripped",
        rubric_version: "2.0",
        acts: [
          {
            act_number: 10,
            char_start: 0,
            char_end: 42,
            card_id: "card_abc",
            judge_score: 0.81,
            writer_adapter: null,
          },
        ],
      },
      1
    );
    expect(normalized).toMatchObject({
      provenance_version: "1.0",
      chapter_number: 1,
      coordinate_space: "stitched_acts_stripped",
      rubric_version: "2.0",
    });
    expect(normalized?.acts).toHaveLength(1);
    expect(normalized?.acts[0]).toMatchObject({
      act_number: 10,
      char_start: 0,
      char_end: 42,
      card_id: "card_abc",
      judge_score: 0.81,
    });
  });

  it("returns null when acts are missing", () => {
    expect(normalizeChapterProvenance({ chapter_number: 1 }, 1)).toBeNull();
  });
});

describe("buildChapterProvenanceMap / loadRfProvenanceDir", () => {
  it("indexes normalized chapter files by chapter number", () => {
    const map = buildChapterProvenanceMap({
      7: {
        chapter_number: 7,
        acts: [{ act_number: 19, char_start: 0, char_end: 10 }],
      },
    });
    expect(map.get(7)?.acts[0].act_number).toBe(19);
  });

  it("loads provenance/ from a story directory", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "ms-rf-prov-"));
    const prov = path.join(root, "provenance");
    await mkdir(prov);
    const storyId = "44444444-4444-4444-8444-444444444444";
    await writeFile(
      path.join(prov, "story.json"),
      JSON.stringify({ story_id: storyId, chapter_numbers: [1] }),
      "utf8"
    );
    await writeFile(
      path.join(prov, "chapter_01.json"),
      JSON.stringify({
        chapter_number: 1,
        acts: [{ act_number: 1, char_start: 0, char_end: 5, card_id: "card_x" }],
      }),
      "utf8"
    );

    const loaded = await loadRfProvenanceDir(root);
    expect(resolveRfStoryId({ provenanceStory: loaded.story })).toBe(storyId);
    expect(loaded.byChapter.get(1)?.acts[0].card_id).toBe("card_x");
  });
});
