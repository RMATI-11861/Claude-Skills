## This machine
- Windows 10 with Windows PowerShell 5.1. Paths contain spaces (`C:\Users\Batista e Associados`): quote every path and build paths with `Join-Path` or `$HOME`.
- Python only through `uv run --with <pkg> python -X utf8 <script>`; `python` and `python3` are Microsoft Store stubs. Node 26 is available.
- Write text files from PowerShell with `[IO.File]::WriteAllText(<absolute path>, $text, (New-Object Text.UTF8Encoding $false))`; `Out-File`, `>` and `-Encoding UTF8` produce UTF-16 or a BOM.
- In a normal console, run scripts with `powershell -NoProfile -ExecutionPolicy Bypass -File <script>` and call `npx.cmd` instead of `npx`.
- The GitHub CLI (`gh`) is not installed; ask the user to paste PR or CI data.
