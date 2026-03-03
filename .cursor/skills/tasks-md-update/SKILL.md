---
name: tasks-md-update
description: Updates and verifies the Midnight Satin implementation task list at .kiro/specs/midnight-satin-platform/tasks.md. Enforces task states ([ ] / [-] / [x]), marks tasks in progress only when work has started, marks complete only after verification; for test tasks requires all tests passing before marking complete. Use when updating the task list, after an assignment is executed, or when coordinating subagent work against tasks.md.
---

# Midnight Satin Task List Update and Verification

This skill governs how **`.kiro/specs/midnight-satin-platform/tasks.md`** is updated and inspected so the task list stays accurate and completion is verified before marking done.

## Task states

| State | Syntax | Meaning |
|-------|--------|--------|
| **Not started** | `[ ]` | Task is not yet started; default for unchecked items. |
| **In progress** | `[-]` | Work for this task is actively in progress. Set only when an assignment has begun and is being worked on. |
| **Complete** | `[x]` | Task is done and **verified**. Set only after inspection confirms the work meets the task criteria (and for test tasks, after all related tests pass). |

Do **not** use `[-]` for “someone might pick this up”; use it only when work is **currently in progress**. Do not use `[x]` until the work has been **inspected and verified** (and for test tasks, until tests pass).

## When to update the task list

- **After an assignment is executed** — Inspect the task list and update it to reflect what was started, what was finished, and what is in progress.
- **When starting work** — Set the specific task(s) being worked on to `[-]` (in progress). Leave other tasks as `[ ]` or `[x]`.
- **When work is finished** — After verifying the work (see below), set the task to `[x]`. If the task was `[-]`, clear in-progress by marking it complete.
- **When handing off or coordinating** — Ensure the task list reflects current state so other agents or the user see accurate status.

## Verification before marking complete

1. **Non-test tasks**  
   - Inspect the deliverable (code, schema, UI, etc.) against the task description and the referenced requirements in `tasks.md`.  
   - If the work satisfies the task and requirements, mark the task `[x]`.  
   - If something is missing or wrong, leave the task as `[-]` and fix or document what’s left to do; do not mark `[x]` until it’s verified.

2. **Test tasks** (items that include property tests, checkpoints, or “Write property test” / “Ensure all tests pass”):  
   - Run the relevant test suite (e.g. Vitest, property tests for that feature).  
   - **If all related tests pass** → Mark the test task `[x]`.  
   - **If any related tests fail** → Do **not** mark the task complete. Keep the task as `[-]` (in progress). Fix the code or tests, then run the tests again. Only mark the task `[x]` when all related tests pass.  
   - Checkpoint tasks (e.g. “Checkpoint - Ensure all tests pass”) are complete only when the full test run passes.

## Workflow for test tasks

```
1. Mark the test task as in progress: [ ] → [-]
2. Run the relevant tests.
3. If all tests pass:
   - Verify the task description and acceptance criteria are met.
   - Mark the task complete: [-] → [x]
4. If any tests fail:
   - Leave (or set) the task to [-] (in progress).
   - Fix the failing tests or the code under test.
   - Re-run the tests.
   - Repeat until all tests pass, then mark [x].
```

Do not mark a test task `[x]` solely because tests were written or run; they must **all pass** before the task is marked complete.

## Inspection after each assignment

After each assignment (or subagent run):

1. **Read** the current `.kiro/specs/midnight-satin-platform/tasks.md`.
2. **Identify** which tasks were targeted by the assignment and which were actually started or finished.
3. **Update** the file:
   - Tasks that were started and are being worked on → `[-]`
   - Tasks that were fully completed and verified (and for test tasks, all tests passing) → `[x]`
   - Tasks that were complete but verification failed or tests failed → revert to `[-]` and note what needs fixing
4. **Leave** tasks that were not touched as `[ ]` or keep their existing state.

## File and syntax

- **File:** `.kiro/specs/midnight-satin-platform/tasks.md`
- **Checkbox syntax:** Use exactly `[ ]`, `[-]`, or `[x]` (space inside brackets for not started, minus for in progress, letter x for complete). Preserve the rest of each line (task number, description, sub-bullets) unchanged.
- **Sub-tasks:** Apply the same state rules to nested items (e.g. 1.1, 1.2, 1.3). A parent task (e.g. “1. Project scaffolding…”) may be marked complete only when all its sub-tasks that are in scope have been verified and, if they are test tasks, all related tests pass.

## Summary

- Use `[-]` only when work is **in progress**.
- Use `[x]` only after **verification**; for test tasks, only after **all related tests pass**.
- If a test task was marked complete but tests later fail, set it back to `[-]` and re-verify after fixes.
- Update and inspect the task list **after each assignment** so the list stays accurate for the next agent or user.
