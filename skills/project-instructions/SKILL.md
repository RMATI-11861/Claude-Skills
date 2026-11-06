---
name: project-instructions
description: "Writes or slims a project CLAUDE.md, AGENTS.md or .claude/rules from lean stack templates, keeping only non-obvious facts."
---

# Project instructions

Every line of CLAUDE.md is paid for in every session. Keep only what Claude cannot learn from the code.

1. **Detect the stack** from the manifests and pick a template: [generic](assets/generic.md), [node-typescript](assets/node-typescript.md), [python-uv](assets/python-uv.md), [dotnet](assets/dotnet.md), [powershell-automation](assets/powershell-automation.md) or [data-sql](assets/data-sql.md).
2. **Verify commands.** Run each candidate (install, one test, all tests, lint, typecheck, build, run). Keep only the ones that work, with their quiet flags.
3. **Keep only non-derivable facts:** conventions that differ from the defaults, pitfalls that cost time, decisions with their reason, the definition of done, and `## Compact instructions`. Drop directory listings, dependency lists and architecture overviews; Claude reads those from the code.
4. **Size.** At most 60 lines. Move folder- or file-type-specific rules to `.claude/rules/<topic>.md` with `paths:` globs ([example](assets/path-rule-example.md)). Personal notes go to `CLAUDE.local.md`, which stays out of git.
5. **Slimming an existing file** (for example `/init` output): apply step 3 line by line, keep anything that records a team decision, and show the removed lines before writing.
6. **Other agents.** When the repo also needs AGENTS.md, put the shared rules there and make CLAUDE.md import it with `@AGENTS.md` plus the Claude-only lines ([bridge](assets/agents-md-bridge.md)). Never use symlinks on Windows.

Report the final line count and every command you verified.
