---
paths:
  - "src/api/**/*.ts"
---

<!-- Save as .claude/rules/api.md. It loads only when Claude reads or edits a matching file. Quote every glob. -->

# API handlers
- Validate request bodies with <schema library> at the top of each handler.
- Return errors as problem+json through `<helper>`; never send raw exceptions to the client.
