# <Project name>

<One line: what this project does.>

## Commands
- Install: `uv sync`
- Test one: `uv run pytest -q -x <path>::<test>`
- Test all: `uv run pytest -q`
- Lint and format: `uv run ruff check --fix` and `uv run ruff format`
- Typecheck: `uv run <mypy or pyright>`
- Run: `uv run python -X utf8 -m <package>`

## Conventions
- Dependencies change only through `uv add` and `uv remove`; never `pip install` into the global interpreter.
- <Typing policy, logging, configuration loading>.

## Pitfalls
- Windows: pass `-X utf8` (or set `PYTHONUTF8=1`) when reading or writing text files.

## Done means
- Ruff and type checks are clean; tests pass; new behavior has tests.

## Compact instructions
Keep the current task and its acceptance criteria, files changed, failing tests with their commands, and decisions made.
