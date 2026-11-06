---
name: debugging
description: "Finds root causes of bugs, errors, crashes, flaky tests or CI failures by reproducing first; locks the fix with a test."
---

# Debugging

Work the loop in order. Propose no fix before step 4 ends.

1. **Feedback loop.** Get one command that shows the failure in under a minute: the failing test, a minimal script, a curl call or a log query. Run it and confirm it fails for the reported reason. If no loop is possible, ask once for what is missing (logs, steps, data).
2. **Minimize.** Shrink input, code path and environment until every remaining piece is needed for the failure. Note what the minimal case rules out.
3. **Hypothesize.** List 3-5 falsifiable hypotheses, most likely first, each with the cheapest experiment that would refute it. Show the list in at most 6 lines.
4. **Probe.** Change one variable per experiment. Add temporary logs tagged `[DBG]` that print the values separating the hypotheses. Stop when one hypothesis survives and explains every symptom.
5. **Fix and lock.** Fix the cause, not the symptom. Add a regression test that fails without the fix (writing-tests skill). Run the loop, then the related suite.
6. **Clean up and report.** Remove every `[DBG]` line (search for the tag). Report in at most 5 lines: root cause, fix, the test that locks it, anything not verified.

Rules:
- Redact secrets and personal data from any output you show.
- Flaky tests and CI-only failures: [references/flaky-and-ci.md](references/flaky-and-ci.md).
- Slowness goes to performance-tuning; slow SQL to sql-and-migrations.
