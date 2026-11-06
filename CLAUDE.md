# Claude-Skills

Portable Agent Skills, path rules and CLAUDE.md layers for Claude Code. `README.md` (pt-BR) is the user-facing catalog.

## Layout
- `skills/<name>/SKILL.md`, plus `references/` or `assets/`: one skill per folder, installed with the skills CLI.
- `rules/*.md`: path-scoped rules copied to `~/.claude/rules/`.
- `claude-md/global.md`: block kept between markers in `~/.claude/CLAUDE.md`. `claude-md/machine.md`: machine facts appended once.
- `settings/user-settings.json`: keys merged into `~/.claude/settings.json` (`outputStyle`, `skillOverrides`).
- `evals/triggers.json` and `evals/fixture/`: trigger matrix and the Node project used by the evals.
- `scripts/`: Node tooling; `lib.mjs` holds the shared helpers.

## Commands
- Validate: `node scripts/validate.mjs` (`--cross-check` also runs skill-creator's quick_validate through uv)
- Discover: `npx.cmd --yes skills add ./ --list`
- Install layers: `node scripts/install.mjs`, then `node scripts/install.mjs --apply`
- Install skills: `$env:DISABLE_TELEMETRY='1'; npx.cmd --yes skills add ./ -g -a claude-code --copy -y`
- Triggers: `node scripts/eval-triggers.mjs [--skill <name>]`; tokens: `node scripts/bench-tokens.mjs`

## Authoring rules
- Name: kebab-case, equal to the folder, at most 64 chars, without `claude` or `anthropic`, never a built-in, bundled or synced name (list in `scripts/validate.mjs`).
- Frontmatter: only `name` and a double-quoted `description`. Description: third person, what it does and when, key terms first, at most 125 chars (`lean-code` 140), no `<`, `>` or `: `.
- The visible skills' listing cost (name + description + 5) stays at or below 2,000 chars. User-only skills are declared in `settings/user-settings.json` through `skillOverrides`, never with Claude-Code-only frontmatter.
- Body: English, imperative, procedures rather than principles, only what Claude does not do by default. Target 100 lines, maximum 500. References one level deep, forward slashes.
- One owner per rule; link instead of copying. Tests: `writing-tests` and `rules/tests.md`. Done criteria: `claude-md/global.md`, extended by the `lean-code` gate. Query performance: `sql-and-migrations`. Security: `global.md`, `http-apis`, `automation-scripts`.
- No `CLAUDE.md` or `AGENTS.md` below the repo root: Claude Code would load it as instructions.
- UTF-8 without BOM, LF endings. README in pt-BR, everything else in English.
- After changing a description, run the validator and `node scripts/eval-triggers.mjs --skill <name>`. Commit or push only when asked.
