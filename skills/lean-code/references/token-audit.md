# Token audit (Claude Code)

Goal: find the largest recurring token costs in this setup and propose changes. Change nothing without the user's go-ahead.

## 1. Live numbers from the user
Ask the user to run and paste `/context` (what fills the window now) and `/usage` (spend by skill, subagent, plugin and MCP server). `/skill-doctor` adds per-skill cost.

## 2. Inspect, read-only
- `~/.claude/settings.json` and the project's `.claude/settings*.json`: `model`, `effortLevel` or `modelSettings`, `outputStyle`, `enabledPlugins`, `skillOverrides`, `env`.
- Instruction files: size of `~/.claude/CLAUDE.md`, the project `CLAUDE.md` and `CLAUDE.local.md`, rules in `.claude/rules/` without `paths:` (always loaded), and the auto-memory `MEMORY.md` (its first 200 lines load every session).
- Skill listing: every enabled plugin skill and personal skill sends its description on each request. The budget is about 1% of the context window (30,000 chars at 1M); past it, descriptions collapse to bare names and stop triggering.
- MCP servers in `~/.claude.json` and `.mcp.json`.

## 3. Rank the levers
Show one table: lever, current value, proposal, expected effect, trade-off. Typical order:

| Lever | Proposal | Effect | Trade-off |
|---|---|---|---|
| Effort | `high` or `medium` for routine work, `/effort` per task | Largest per-turn cut in thinking tokens | Hard problems may need more |
| Model | A cheaper model for routine tasks via `/model` | Lower price per token | Less capable on hard tasks |
| Unused plugins | Disable with `/plugin` | Removes their descriptions from every request | Lose those skills |
| Unused MCP servers | Disable with `/mcp` | Fewer tool definitions | Lose those tools |
| Instruction files | Keep only non-derivable facts; move folder rules to `.claude/rules` with `paths:` | Smaller fixed context | Maintenance |
| Output style | `"outputStyle": "Concise"` | Shorter replies | Less narration |
| Rarely used personal skills | `skillOverrides` set to `name-only` or `user-invocable-only` | Shorter listing | Less auto-triggering |
| Session hygiene | `/clear` between topics, `/compact <focus>`, `/rewind` instead of long corrections | Less context per turn | Lose history |

## 4. Report
At most 10 lines plus the table. Apply only approved items; settings changes go through the update-config skill.
