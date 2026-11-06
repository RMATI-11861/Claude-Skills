---
paths:
  - ".github/workflows/**"
  - ".github/actions/**"
---

# GitHub Actions
- Pin third-party actions to a full commit SHA, with the version in a comment.
- Set top-level `permissions: contents: read` and widen per job only as needed.
- Never run untrusted pull request code with secrets (`pull_request_target`, `workflow_run`).
- Set `timeout-minutes` on every job and a `concurrency` group on deploy workflows.
- Pass secrets through `env`; never echo them.
- Shell steps: `set -euo pipefail`, or `$ErrorActionPreference = 'Stop'` in pwsh.
