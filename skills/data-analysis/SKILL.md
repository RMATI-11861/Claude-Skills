---
name: data-analysis
description: "Answers questions from CSV, Excel, JSON, logs or SQL with verified numbers and a reproducible script, not a spreadsheet file."
---

# Data analysis

Deliver findings (numbers with context) and the script that produced them. Hand-offs: a spreadsheet deliverable goes to the xlsx skill, charts to dataviz, a shareable report to docs.

1. **Question to metrics.** Restate the question as precise metrics: definition, filters, period, grain, currency and time zone. Ask only when a definition changes the answer materially.
2. **Profile before analyzing.** Size, columns and types, nulls, duplicate keys, ranges, distinct counts, a few sample rows. Detect encoding, delimiter and decimal separator; Brazilian files often use `;`, a decimal comma and `dd/MM/yyyy` ([references/csv-pitfalls.md](references/csv-pitfalls.md)).
3. **Assumptions.** List exclusions, deduplication and join keys before computing.
4. **Reproducible script.** Do the work in a script, not ad hoc edits: Python through `uv run --with pandas` (or duckdb), Node, PowerShell `Import-Csv`, or SQL. Never modify the raw input; write derived data elsewhere.
5. **Reconcile.** Check row counts and totals against the source before and after each filter and join, and explain every difference.
6. **Report.** Lead with the answer, then a small table of the key numbers, then only the caveats that change the interpretation. Give the command that reruns the script.
