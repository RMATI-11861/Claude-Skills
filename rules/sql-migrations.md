---
paths:
  - "**/*.sql"
  - "**/migrations/**"
  - "**/Migrations/**"
  - "**/db/migrate/**"
  - "**/alembic/versions/**"
  - "**/schema.prisma"
---

# SQL and migrations
- Never edit a migration that has been applied anywhere; add a new one.
- Breaking changes go expand, migrate, contract across separate deploys.
- Backfills run in batches, are idempotent and live outside the schema migration.
- Index every foreign key; build indexes online where the engine supports it.
- Provide a down migration, or state in a comment why it is irreversible.
- Parameterize every query; never build SQL by concatenating input.
- Run EXPLAIN before and after changing a hot query.
