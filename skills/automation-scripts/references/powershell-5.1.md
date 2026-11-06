# Windows PowerShell 5.1

## Skeleton

```powershell
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][ValidateScript({ Test-Path -LiteralPath $_ })][string]$Source,
    [Parameter(Mandatory)][string]$Destination
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    if (-not (Test-Path -LiteralPath $Destination)) {
        if ($PSCmdlet.ShouldProcess($Destination, 'Create folder')) {
            New-Item -ItemType Directory -Path $Destination | Out-Null
        }
    }
    # Each further change goes inside its own ShouldProcess check.
    exit 0
} catch {
    [Console]::Error.WriteLine("Failed: $($_.Exception.Message)")
    exit 1
}
```

## Traps
- Encodings: `Out-File` and `>` write UTF-16LE, `Set-Content` writes ANSI, `-Encoding UTF8` adds a BOM. Write with `[IO.File]::WriteAllText($absolutePath, $text, (New-Object Text.UTF8Encoding $false))`.
- Reading UTF-8 files: `Get-Content -Raw -Encoding UTF8` (the default is ANSI).
- Script files with accented text must be saved as UTF-8 with BOM, or kept ASCII.
- `Copy-Item -Recurse src existingFolder` nests `src` inside it: create the destination, then copy `src\*`.
- Missing in 5.1: ternary, `??`, `&&` and `||`, `ForEach-Object -Parallel`, `-MaximumRetryCount`, `ConvertFrom-Json -AsHashtable`.
- `2>&1` on native executables turns stderr lines into error records; check `$LASTEXITCODE` instead.
- `ConvertTo-Json` stops at depth 2 by default: pass `-Depth 10`.
- `Invoke-RestMethod` sends string bodies as ISO-8859-1: pass UTF-8 bytes. Enable TLS 1.2 first: `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`.
- Comparisons: `$null -eq $x` (left side); `-eq` against an array filters instead of comparing.
- Execution policy in a normal console: `powershell -NoProfile -ExecutionPolicy Bypass -File script.ps1`.
