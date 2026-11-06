---
name: building-features
description: "Delivers multi-file features in thin verified slices, from acceptance criteria to an end-to-end check; not one-line edits."
---

# Building features

Use for work that spans several files or layers. For a one-line change, just make it.

1. **Criteria.** Write at most 5 acceptance criteria as checkable Given/When/Then lines. Ask only about a criterion you cannot decide from the code or the request, and propose a default.
2. **Precedent.** Find the closest existing feature and mirror its file layout, naming, error handling and tests. Reuse its helpers.
3. **Tracer slice.** Build the thinnest path that crosses every layer (input, logic, storage, output) and run it end to end. Then widen slice by slice; each slice ends green.
4. **Tests with each slice.** Follow the writing-tests skill. API contracts follow http-apis; schema changes follow sql-and-migrations.
5. **Scope.** No drive-by refactors, renames or reformatting of untouched code. List them for later instead.
6. **Evidence.** Finish with a table: criterion, how it was verified (command, test name or manual step), result. Mark anything unverified.

Hand-offs: run and observe the app with `/run`; correctness review with `/code-review`; cleanup of the diff with `/simplify`.
