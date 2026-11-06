---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/test_*.py"
  - "**/*_test.py"
  - "**/*_test.go"
  - "**/*.Tests.ps1"
  - "**/*Tests.cs"
  - "**/test/**"
  - "**/tests/**"
  - "**/__tests__/**"
---

# Test files
- Never weaken, skip or delete an assertion or a test to get green; if a test is wrong, say why and change it explicitly.
- Test behavior through the public interface; mock only process boundaries (network, clock, filesystem, randomness).
- Deterministic: fixed seeds, injected clock, no sleeps, no order dependence, no shared mutable state.
- One behavior per test, named after the expected behavior.
- A bug fix starts with a test that fails for the reported reason.
- Run the single file or case first, then the suite.
