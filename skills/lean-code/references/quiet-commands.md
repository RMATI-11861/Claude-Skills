# Quiet commands

Prefer these forms. Check the exit code, not only the printed tail. Confirm a flag with `--help` when the installed version differs.

## Git
- `git status -sb`
- `git diff --stat`, then `git diff -U0 -- <path>` for the lines that matter
- `git log --oneline -n 20`; `git show --stat <sha>`

## Node
- One test file: `node --test --test-reporter=dot test/x.test.js`; one test: add `--test-name-pattern "<name>"`
- npm: `npm test --silent`; install: `npm ci --no-audit --no-fund --loglevel=error`
- TypeScript: `npx tsc --noEmit --pretty false`
- ESLint, errors only: `npx eslint <path> --quiet`
- Vitest: `npx vitest run <path> -t "<name>" --reporter=dot`
- Jest: `npx jest <path> -t "<name>" --silent`

## Python (uv)
- `uv run pytest -q -x <path>::<test>`
- `uv run ruff check --quiet <path>`; `uv run ruff format --check <path>`

## .NET
- `dotnet build -v q --nologo`
- `dotnet test -v q --nologo --filter "FullyQualifiedName~<name>"`

## PowerShell
- Pester 3.4: `$r = Invoke-Pester -Path .\tests -PassThru -Quiet; "$($r.PassedCount) passed, $($r.FailedCount) failed"`
- Lint: `Invoke-ScriptAnalyzer -Path <path> -Severity Error,Warning`

## Capping long output
- PowerShell 5.1: `<command> | Select-Object -Last 40` (stdout only; do not add `2>&1` to native commands, it turns stderr lines into errors). Logs: `Get-Content <file> -Tail 40`. Search: `Select-String -Path <file> -Pattern 'error|fail' | Select-Object -First 20`.
- Bash: `<command> 2>&1 | tail -n 40`, then `echo "${PIPESTATUS[0]}"` for the real exit code.
- Large files: search first, then read the matching range. Never print a whole lockfile, minified bundle or generated file.
