---
name: repo-docs
description: "Writes repository docs such as README, CHANGELOG, ADRs, CONTRIBUTING and docstrings; not shareable docs or Word files."
---

# Repository docs

For Markdown files committed to the repo and for docstrings. Shareable documents go to the docs skill, Word files to docx, and CLAUDE.md or AGENTS.md to project-instructions.

1. **Reader and task.** Name the reader (new contributor, user, operator, future maintainer) and the task the doc must enable. Write only for that.
2. **Template.** Start from [the README](assets/readme.md), [ADR](assets/adr.md) or [changelog](assets/changelog.md) template.
3. **Facts from the repo.** Take commands, versions and config keys from the code and manifests, never from memory. Run every command you document, or mark it as untested.
4. **Style.** Task-oriented headings, examples before prose, short sentences, no marketing. Link instead of repeating.
5. **Docstrings** document the contract: purpose, parameters, return value, errors and side effects, not the implementation. Follow the language convention (JSDoc, Google-style docstrings, XML docs, comment-based help).
6. **Keep docs current.** Update the README and changelog in the same change that alters behavior.
