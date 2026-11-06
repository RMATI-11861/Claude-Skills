---
name: automation-scripts
description: "Writes robust PowerShell, Bash or Node scripts, Task Scheduler jobs and CI workflows with params, dry-run, exit codes."
---

# Automation scripts

1. **Spec first, at most 5 lines.** Inputs, outputs, side effects, run context (account, working directory, schedule), target runtime (Windows PowerShell 5.1 unless stated), and how failures are reported.
2. **Skeleton.** Validated parameters; a dry run (`-WhatIf` through `SupportsShouldProcess`, or `--dry-run`); fail fast (`Set-StrictMode` and `$ErrorActionPreference = 'Stop'`, or `set -euo pipefail`); explicit exit codes (0 success, 1 failure, 2 bad input).
3. **Idempotent.** Check before changing (exists, already done, same content) so reruns are safe. Write to a temp file and rename for atomic updates.
4. **Paths and encoding.** Quote every path; build paths with `Join-Path`, `$PSScriptRoot` or `path.join`; never hardcode a user folder. Write UTF-8 without BOM.
5. **Secrets.** Read them from environment variables or the OS credential store, never from the script or its arguments, and never log them.
6. **Logging.** One timestamped line per action; errors go to stderr with the failing input.
7. **Verify.** Run the dry run, then a real run against a test target, and show both outputs.

References: [references/powershell-5.1.md](references/powershell-5.1.md) (skeleton and traps), [references/scheduling.md](references/scheduling.md) (Task Scheduler, cron, GitHub Actions). Cloud routines that run Claude itself belong to the built-in schedule skill.
