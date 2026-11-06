# Ecosystem commands

| Ecosystem | Outdated | Why installed | Audit | Upgrade one |
|---|---|---|---|---|
| npm | `npm outdated` | `npm explain <pkg>` | `npm audit --omit=dev` | `npm install <pkg>@<version>` |
| pnpm | `pnpm outdated` | `pnpm why <pkg>` | `pnpm audit --prod` | `pnpm add <pkg>@<version>` |
| Yarn 2+ | `yarn upgrade-interactive` | `yarn why <pkg>` | `yarn npm audit` | `yarn up <pkg>@<version>` |
| uv (Python) | `uv pip list --outdated` | `uv tree --invert --package <pkg>` | `uv run --with pip-audit pip-audit` | `uv add "<pkg>==<version>"` or `uv lock --upgrade-package <pkg>` |
| .NET (NuGet) | `dotnet list package --outdated` | `dotnet list package --include-transitive` | `dotnet list package --vulnerable` | `dotnet add package <pkg> --version <version>` |
| PowerShell modules | `Find-Module <name>` versus `Get-InstalledModule <name>` | module manifest `RequiredModules` | none built in | `Update-Module <name> -RequiredVersion <version>` |

Codemods: check the project's upgrade guide first (for example `npx @next/codemod`, `npx react-codemod`, `dotnet-upgrade-assistant`).
