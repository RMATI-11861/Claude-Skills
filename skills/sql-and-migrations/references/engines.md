# Engine specifics

## PostgreSQL
- Online index: `CREATE INDEX CONCURRENTLY` (not inside a transaction block).
- Constraints: `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` in a later step (lighter lock).
- A new column with a constant default is metadata-only (PostgreSQL 11+); a volatile default rewrites the table.
- Plans: `EXPLAIN (ANALYZE, BUFFERS) <query>`. In migrations, set `SET lock_timeout = '5s'` to fail fast instead of queueing.
- Types: `numeric(12,2)` for money, `timestamptz` for instants.

## SQL Server
- Online index: `CREATE INDEX ... WITH (ONLINE = ON)` (Enterprise, Developer and Azure SQL).
- Plans: `SET STATISTICS IO, TIME ON` plus the actual execution plan; watch for key lookups and implicit conversions.
- Large updates escalate locks: batch them (`UPDATE TOP (5000) ...` in a loop until no rows change).
- Types: `decimal(19,4)` for money, `datetimeoffset` for instants.

## MySQL (InnoDB)
- Online DDL: `ALTER TABLE ... ALGORITHM=INPLACE, LOCK=NONE` fails fast when not possible; for very large tables use gh-ost or pt-online-schema-change.
- DDL is not transactional: a failed multi-step migration leaves partial state, so keep one DDL statement per migration.
- Plans: `EXPLAIN ANALYZE` (8.0.18+). Types: `DECIMAL(12,2)`; store `DATETIME` in UTC.

## SQLite
- `ALTER TABLE` is limited: rebuild the table (create new, copy, drop old, rename) in one transaction, with `PRAGMA foreign_keys=OFF` around it.
- Plans: `EXPLAIN QUERY PLAN <query>`.
