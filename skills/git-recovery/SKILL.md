---
name: git-recovery
description: "Recovers safely from git trouble, such as merge or rebase conflicts, bad commits, work lost after reset, leaked secrets."
---

# Git recovery

1. **Snapshot first.** Run `git status`, `git stash list` and `git log --oneline --graph --all -n 30`. Before any history rewrite, create a backup ref: `git branch backup/<yyyyMMdd-HHmm>`.
2. **Pick the scenario** in [references/scenarios.md](references/scenarios.md). State the plan and its undo before running anything that rewrites history or discards work.
3. **Ask before** force-pushing, deleting branches, or rewriting history others may have pulled.
4. **Verify** with `git log`, `git status` and the tests, then report what changed and how to undo it.

## Conflicts
- For each hunk, read both sides and the base: `git diff`, `git log --merge -p -- <file>`. Resolve hunk by hunk, keeping both intents when they are compatible.
- Never take `--ours` or `--theirs` for a whole file unless the user confirms that one side wins entirely.
- After resolving, build and run the tests before `git add` and `--continue`.
