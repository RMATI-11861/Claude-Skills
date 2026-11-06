---
paths:
  - "**/*.ps1"
  - "**/*.psm1"
  - "**/*.psd1"
---

# PowerShell scripts
- Target Windows PowerShell 5.1 unless the repo states 7+: no ternary, `??`, `&&`, `||` or `ForEach-Object -Parallel`.
- Start with `[CmdletBinding(SupportsShouldProcess)]` and a validated `param()` block; wrap every state change in `$PSCmdlet.ShouldProcess(...)`.
- Use `Set-StrictMode -Version Latest` and `$ErrorActionPreference = 'Stop'`; entry scripts end with an explicit `exit <code>`.
- Paths: `-LiteralPath`, `Join-Path`, `$PSScriptRoot`; never hardcode a user folder.
- No aliases or positional parameters in scripts; put `$null` on the left of comparisons.
- Save `.ps1` files as ASCII, or as UTF-8 with BOM when they contain accented text (5.1 reads BOM-less files as ANSI).
- Write text output with `[IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding $false))`.
- `Copy-Item -Recurse` onto an existing folder nests it; create the destination and copy `<src>\*` instead.
- Tests use Pester 3.4 syntax (`Should Be`, not `Should -Be`) unless the repo pins Pester 5.
