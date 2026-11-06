---
name: lean-code
description: "Strict minimum-token mode, clean-code delivery gate and token-cost audit. Use when asked to save tokens or cost, be terse, or polish code."
---

# Lean code

Choose the mode from the request or its arguments: `strict` (default), `ultra`, `gate` or `audit`. `strict` and `ultra` stay on for the rest of the session until the user says "lean off".

## strict

1. Locate before reading: Grep or Glob first, then read only the needed range. Never read a file over ~300 lines whole; never re-read a file that has not changed.
2. One batched round of searches and reads per question, run in parallel.
3. Quiet tools: use [references/quiet-commands.md](references/quiet-commands.md); show only the tail of long output; skip lockfiles and generated, minified or vendored files.
4. At most one question, with a recommended default, and only when the answer changes the work. Otherwise state the assumption in one line and proceed.
5. Deliver only what was asked: no extra docs, summaries, examples or speculative tests.
6. Replies of at most 5 lines unless detail is requested. Show diffs or changed lines, never a file you just wrote.
7. Keep work in the main context; use a subagent only to keep a large one-off output out of it.

## ultra

`strict`, and the reply is only the diff (or a `file:line` list) plus one verification line. Never shorten errors, failing test output, security warnings or confirmations of destructive actions.

## gate

Run before delivering code. Execute every item; do not tick from memory.

```
- [ ] Formatter, linter, typecheck (project config): <command> -> <result>
- [ ] Narrowest relevant tests, then the suite if cheap: <command> -> <result>
- [ ] Each bug fix has a regression test that failed before the fix
- [ ] git diff -U0 scanned: no debug output, commented-out code, stray TODOs or unrelated edits
- [ ] Lockfile diff: no new dependency, or the user approved it
- [ ] Intent-revealing names; errors handled at boundaries with actionable messages; precise types
```

Report the result in at most 5 lines, separating verified from not verified. Suggest `/simplify` or `/code-review` only for diffs over ~300 lines, and say they cost extra tokens.

## audit

Claude Code only. Follow [references/token-audit.md](references/token-audit.md); change nothing without the user's go-ahead.

## Surfaces without output styles

On claude.ai or the API, also: lead with the result, cut narration and restatement, answer simple questions in 1-3 sentences, keep errors and warnings complete.
