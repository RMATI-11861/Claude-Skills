# <Solution name>

<One line: what this solution does.>

## Commands
- Build: `dotnet build -v q --nologo`
- Test one: `dotnet test -v q --nologo --filter "FullyQualifiedName~<Namespace.Class.Method>"`
- Test all: `dotnet test -v q --nologo`
- Format check: `dotnet format --verify-no-changes`
- Run: `dotnet run --project <path>`

## Conventions
- Nullable reference types are enabled; warnings are errors in <projects>.
- <Dependency injection, logging and options patterns in use>.
- EF Core migrations: `dotnet ef migrations add <Name> --project <path>`; never edit an applied migration.

## Pitfalls
- <...>

## Done means
- Build has no warnings, the format check is clean and tests pass.

## Compact instructions
Keep the current task and its acceptance criteria, files changed, failing tests with their commands, and decisions made.
