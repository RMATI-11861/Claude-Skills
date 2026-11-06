# <Repo name>

<One line: which processes these scripts automate.>

## Commands
- Dry run a script: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\<name>.ps1 -WhatIf`
- Tests (Pester <3.4 or 5>): `Invoke-Pester -Path .\tests`
- Lint: `Invoke-ScriptAnalyzer -Path . -Recurse -Severity Error,Warning`

## Conventions
- Target Windows PowerShell 5.1; every script supports `-WhatIf`.
- Logs go to `<path>`; scheduled task names start with `<prefix>`.
- Secrets come from <Credential Manager or environment variables>, never from the script.

## Pitfalls
- <Paths with spaces, mapped drives missing in scheduled tasks, permissions of the run-as account>

## Done means
- Dry run shown, real run against a test target, Pester tests pass.

## Compact instructions
Keep the current task, scripts changed, test commands and failures, and decisions made.
