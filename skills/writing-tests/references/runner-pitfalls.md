# Runner pitfalls

## Pester (PowerShell)
- Pester 3.4 ships with Windows: use `Should Be`, `Should Throw`, `Should BeNullOrEmpty` (no dash). `Should -Be` is Pester 4/5 syntax.
- Pester 5 separates discovery from run: code outside `It`, `BeforeAll` and `BeforeEach` runs at discovery time. Put setup in `BeforeAll`.
- One file: `Invoke-Pester -Path .\tests\X.Tests.ps1` (3.4) or add `-Output Detailed` (5).

## node:test
- One file: `node --test test/x.test.js`; one test: `--test-name-pattern "<name>"`.
- Fake time: `mock.timers.enable({ apis: ['Date', 'setTimeout'] })` from `node:test`, reset in `afterEach`.
- Pass explicit file paths on Windows instead of relying on shell globs.

## Vitest and Jest
- Jest needs `NODE_OPTIONS=--experimental-vm-modules` (or a transform) for native ESM; Vitest is ESM-native. Never mix `jest.fn` and `vi.fn`.
- `jest.mock` and `vi.mock` are hoisted: variables used inside the factory must start with `mock` (Jest) or come from `vi.hoisted` (Vitest).
- Fake timers: restore real timers in `afterEach`; in Vitest await `vi.advanceTimersByTimeAsync` for promise-based code.

## pytest (via uv)
- One test: `uv run pytest -q -x path/test_x.py::test_name`. Fixtures in `conftest.py` apply per directory.
- Use `tmp_path` and `monkeypatch` instead of touching real files or environment variables.

## dotnet test
- One test: `dotnet test --filter "FullyQualifiedName~Namespace.Class.Method" -v q`.
- xUnit runs test classes in parallel by default; shared static state makes tests flaky.
