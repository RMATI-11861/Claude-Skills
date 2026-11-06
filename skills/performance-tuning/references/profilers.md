# Profilers

## Timing
- PowerShell: run `Measure-Command { <command> }` 5+ times and report the median.
- Bash: `hyperfine '<command>'` when installed; otherwise `time` in a loop.

## Node.js
- CPU: `node --cpu-prof app.js` writes a `.cpuprofile`; open it in Chrome DevTools (Performance) or summarize the top functions.
- Memory: `node --heap-prof app.js`, or start with `--inspect` and take heap snapshots in DevTools; `process.memoryUsage()` for quick checks.
- Event loop delay: `monitorEventLoopDelay()` from `node:perf_hooks`.

## Python (via uv)
- Deterministic: `uv run python -X utf8 -m cProfile -s cumtime script.py`, then keep the first 40 lines.
- Sampling: `uv run --with py-spy py-spy record -o profile.svg -- python script.py`.
- Memory: `tracemalloc.start()`, then `tracemalloc.take_snapshot().statistics('lineno')[:10]`.

## .NET
- Live counters: `dotnet-counters monitor --process-id <pid>` (install with `dotnet tool install -g dotnet-counters`).
- Traces: `dotnet-trace collect --process-id <pid>`; open the `.nettrace` in Visual Studio or PerfView.
- Micro-benchmarks: BenchmarkDotNet.

## Browser
- DevTools Performance panel for runtime; Lighthouse for page-level metrics.
