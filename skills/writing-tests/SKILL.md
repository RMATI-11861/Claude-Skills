---
name: writing-tests
description: "Adds or reworks automated tests, including TDD, when asked for tests or coverage; tests behavior via public interfaces."
---

# Writing tests

1. **Mirror the neighbors.** Copy the runner, location, naming, fixtures and assertion style of the nearest existing test file. With no tests in the repo, use the stack's default runner and say so.
2. **Behaviors first.** List what to cover as test names before writing code: happy path, edge cases, errors. Skip what the type system already guarantees.
3. **One slice at a time.** Write one failing test, make it pass with the smallest change, repeat. For existing code without tests, first pin current behavior with characterization tests.
4. **Public interface only.** Mock only process boundaries: network, clock, filesystem, randomness, external services.
5. **Deterministic.** Fixed seeds, injected clock, no sleeps, no order dependence.
6. **Prove it can fail.** Break the code or the expectation once and watch each new test go red.
7. **Run narrow, then wide.** The single file first, then the suite. Report the command and the pass/fail counts.

Never weaken, skip or delete an existing assertion to get green; if a test is wrong, say why.

Runner traps: [references/runner-pitfalls.md](references/runner-pitfalls.md).
