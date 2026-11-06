---
name: performance-tuning
description: "Speeds up slow code or cuts memory and CPU use by measuring first, profiling, fixing the top bottleneck, re-measuring."
---

# Performance tuning

1. **Define.** Metric (p95 latency, throughput, peak memory, CPU time), target, and a representative workload. If no target is given, propose one.
2. **Baseline.** Warm up, then measure at least 5 runs on the same machine; record the median and the spread. Tools: [references/profilers.md](references/profilers.md).
3. **Profile, don't guess.** Find where time or memory goes: CPU profile, heap snapshot or allocations, I/O and lock waits, query counts.
4. **Fix the top bottleneck only.** Prefer algorithmic and I/O fixes (batching, caching, removing N+1, streaming) over micro-optimizations.
5. **Re-measure** with the same workload. Keep the change only if it beats the noise; otherwise revert it.
6. **Report** a before/after table (metric, baseline, after, change) and the next hotspot.

Slow SQL goes to sql-and-migrations. React or Next.js rendering goes to the react-best-practices skill when it is installed.
