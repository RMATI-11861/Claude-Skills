---
name: sql-and-migrations
description: "Handles schema changes, migrations and slow SQL via constraints, expand-migrate-contract, batched backfills and EXPLAIN."
---

# SQL and migrations

Identify the engine and the migration tool first and follow their conventions. Engine specifics: [references/engines.md](references/engines.md).

## Schema
- Enforce integrity in the database: NOT NULL, FK, UNIQUE, CHECK. Use exact numeric types for money and timezone-aware timestamps for instants.
- Name constraints and indexes explicitly so later migrations can target them.

## Migrations
1. Classify the change: additive (safe), behavior-changing, or breaking (rename, drop, type change, new NOT NULL).
2. Ship breaking changes as expand, migrate, contract across separate deploys: add the new shape, backfill or dual-write, switch reads, then remove the old shape.
3. Backfills run in batches, are idempotent and resumable, and live outside the schema migration.
4. Avoid long locks: build indexes online, avoid volatile defaults on new columns, add constraints unvalidated and validate them separately where the engine allows.
5. Never edit an applied migration; write a new one. Provide a down migration or state why it is irreversible.
6. For large tables, rehearse on a copy with realistic volume and report lock and time impact.

## Slow queries
1. Capture the exact query and parameters; run EXPLAIN (with ANALYZE on a safe copy) before changing anything.
2. Look for full scans of large tables, bad row estimates, sorts spilling to disk, and N+1 patterns in the calling code.
3. Apply the narrowest fix: an index that matches the filter and sort, a rewritten query, or batching the N+1. Re-run EXPLAIN and compare.

Parameterize every query; never concatenate input into SQL.
