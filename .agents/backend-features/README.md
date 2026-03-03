# Backend-features subagent

**Scope:** Feature server actions and data layer: bookmarks, reading progress, chapter unlock (Veil), character endorsements, author follow, and comments (CRUD + likes). All credit-changing operations use transactions with row-level locking.

## Skills to load

Place or reference skills in **this directory** (or in `.cursor/skills/` and list below):

| Skill | Purpose |
|-------|---------|
| Vercel Postgres | Queries, transactions, row-level locking for credit operations |
| TypeScript & domain types | ReadingProgress, CreditTransaction, Comment, CommentLike, etc. |

## Task scope (from `tasks.md`)

- 7.2 — toggleBookmark, getBookmarks
- 8.2 — saveReadingProgress, getReadingProgress (10s debounce, scroll restore)
- 8.3 — unlockChapter (Veil), DB transaction + locking
- 10.2 — endorseCharacter, trophy threshold (1000)
- 11.2 — followAuthor, bibliography grouping by Series
- 14.2 — getChapterComments, postComment, editComment, deleteComment, likeComment, unlikeComment; 800-char limit

## Dependencies

- Requires **backend-data** (schema, types).
- Requires **backend-auth** (session for reader-scoped actions).

## Reference

- Requirements: 2.13, 3.7, 4.1–4.6, 6.4–6.6, 7.5–7.7, 16.x, 19.x in `.kiro/specs/midnight-satin-platform/requirements.md`
- Design doc: Server Actions list, correctness properties (e.g. 2, 3, 4, 5, 11, 16, 17, 25, 26)
