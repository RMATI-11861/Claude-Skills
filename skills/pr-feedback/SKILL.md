---
name: pr-feedback
description: "Addresses pull request review comments by fetching unresolved threads, triaging, fixing and replying when the user asks."
---

# PR feedback

Needs the GitHub CLI (`gh auth status`). Without it, ask the user to paste the review comments and skip the fetching and replying steps.

1. **Find the PR:** `gh pr view --json number,url,headRefName` on the current branch, or the number the user gave.
2. **Fetch unresolved threads** through GraphQL, because REST has no resolved flag: [references/gh-queries.md](references/gh-queries.md).
3. **Triage** each thread as must (correctness, security, broken contract), should (clear improvement), nit (style), question or disagree. Show the table and ask once which to address, defaulting to must and should.
4. **Fix** one thread at a time with the smallest change, running the related tests after each.
5. **Reply** on each addressed thread with what changed (commit SHA) or why not. Ask before resolving threads or pushing.
6. **Report** the threads addressed, skipped and still open.
