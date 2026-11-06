# <Repo name>

<One line: which questions or reports this repo answers.>

## Data
- Sources: <database or files>, read-only. Data dictionary: `<path>`.
- Raw data in `<raw path>` is never modified; derived data goes to `<derived path>`.
- Input encoding and locale: <UTF-8 or Windows-1252>, <decimal comma>, <date format>.
- Personal data: <PII columns and how to handle them>.

## Commands
- Run an analysis: `uv run --with pandas python -X utf8 analyses/<name>.py`
- SQL dialect: <PostgreSQL, SQL Server, ...>; run queries with `<client command>`.

## Conventions
- Every published number comes from a script in `analyses/`, never from manual edits.
- Reconcile totals against <source report> before publishing.

## Compact instructions
Keep the question being answered, metric definitions, scripts changed and reconciliation results.
