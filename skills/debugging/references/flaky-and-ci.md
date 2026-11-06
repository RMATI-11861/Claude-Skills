# Flaky tests and CI-only failures

## Flaky tests
1. Measure the failure rate by running the single test in a loop:
   - PowerShell: `1..50 | ForEach-Object { <command> *> $null; if ($LASTEXITCODE) { "fail $_" } }`
   - Bash: `for i in $(seq 50); do <command> >/dev/null 2>&1 || echo "fail $i"; done`
2. Check the usual causes in order: state shared between tests, time and time zones, ordering of async work, randomness without a seed, real network or filesystem, leaked resources (timers, connections, handles).
3. Fix the cause. Never add retries or sleeps to hide it. Confirm with the same loop.

## CI-only failures
1. Get the failing log: `gh run view <run-id> --log-failed` with the GitHub CLI, or ask the user to paste the failing step.
2. Compare environments: OS and shell (paths, line endings, case sensitivity), runtime and tool versions, env vars and secrets, locale and time zone, clean install versus local cache, parallelism.
3. Reproduce locally with the CI command and versions before changing code.
