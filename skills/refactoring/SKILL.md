---
name: refactoring
description: "Restructures code beyond the current diff without changing behavior, e.g. extracting modules or renaming across files."
---

# Refactoring

To clean up code you just changed, use `/simplify` instead.

1. **Target.** State in at most 3 lines the target structure and why (the change it enables or the cost it removes). Stop if the reason is only taste.
2. **Safety net.** Run the suite and record the result. Where coverage is thin at the seams you will move, first add characterization tests that pin current behavior (writing-tests skill).
3. **Small steps.** Move one thing at a time: extract, move, rename, inline. Each step compiles and passes the tests before the next. Prefer tool-driven renames and let compiler or type errors list the call sites.
4. **No behavior change.** Bug fixes, features and dependency updates go in separate changes. If you find a bug, note it and keep going.
5. **Public surface.** Keep exported names and signatures stable, or add a deprecated alias and list the callers to migrate.
6. **Finish.** Run the full suite, compare with step 2, and report what moved where in at most 5 lines.
