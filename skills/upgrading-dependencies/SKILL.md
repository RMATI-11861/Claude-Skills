---
name: upgrading-dependencies
description: "Upgrades packages, runtimes or frameworks safely, reading changelogs first and moving one major version at a time."
---

# Upgrading dependencies

1. **Inventory.** List current and target versions and the reason (security advisory, needed feature, end of life) with the ecosystem's outdated and audit commands: [references/ecosystems.md](references/ecosystems.md).
2. **Why pinned.** For each package that is pinned or held back, find out why before changing it: `git log -p -- <manifest>`, comments, linked issues.
3. **Read before editing.** Read the changelog or migration guide of every version crossed. List the breaking changes that touch this codebase, searching for each affected API.
4. **One step at a time.** One package (or a tightly coupled group) and one major version per step. Apply the official codemod when there is one.
5. **Verify each step.** Clean install from the lockfile, build, typecheck, full test suite and a smoke run of the app. Fix forward or revert the step; never stack unverified steps.
6. **Commit per step** with the lockfile, so any step can be reverted alone. Report package, from, to, breaking changes handled and how it was verified.

Runtime upgrades (Node, Python, .NET) also update the version files (`.nvmrc`, `engines`, `pyproject.toml`, `global.json`), CI images and Dockerfiles in the same step.
