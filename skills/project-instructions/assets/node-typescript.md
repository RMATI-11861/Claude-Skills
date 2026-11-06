# <Project name>

<One line: what this app or library does.>

## Commands
- Install: `npm ci` (the lockfile is the source of truth; `npm install <pkg>` only to add)
- Test one: `npx vitest run <path> -t "<name>"`
- Test all: `npm test --silent`
- Typecheck: `npx tsc --noEmit --pretty false`
- Lint: `npx eslint . --quiet`
- Run: `npm run dev`
<!-- Swap the test commands for node --test or npx jest when the repo uses them. -->

## Conventions
- Modules: <ESM or CommonJS>; imports use <file extensions or path aliases>.
- Input validation and errors at the edges: <library and pattern>.
- Every new environment variable goes into `.env.example`; `.env` is never committed.

## Pitfalls
- <ESM-only dependency, Node version pinned in .nvmrc, Windows path handling>

## Done means
- Typecheck, lint and tests pass; new behavior has tests.

## Compact instructions
Keep the current task and its acceptance criteria, files changed, failing tests with their commands, and decisions made.
