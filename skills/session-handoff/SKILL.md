---
name: session-handoff
description: "Writes a handoff file that lets a fresh session or teammate resume long work. Use only when the user asks for a handoff."
---

# Session handoff

Write a file that a fresh session can act on without this conversation.

1. **Path.** The OS temp folder (`$env:TEMP` on Windows, else `$TMPDIR` or `/tmp`), named `handoff-<yyyyMMdd-HHmm>-<slug>.md`. If the user said what the next session is for, tailor the file to that.
2. **Content, at most 40 lines:**
   - Goal and acceptance criteria
   - State: done, in progress, blocked
   - Decisions, each with its reason
   - Files and commits by path or SHA; plans, issues and PRs by path or URL (never copy them)
   - Exact commands that verify the current state
   - Next steps, in order
   - Open questions
   - Skills to use next (for example debugging or building-features)
3. **Redact** secrets and personal data.
4. **Hand over.** Print the path and a one-line opening prompt, such as `Leia <path> e continue pelos próximos passos.`, then suggest `/clear`.
