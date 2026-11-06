## Working rules
- Reply in Brazilian Portuguese.
- Run the narrowest check first with quiet reporters; show only the last ~40 lines of long output; skip lockfiles and generated, minified or vendored files.
- For questions across many unfamiliar files, use the Explore subagent and ask for at most 200 words with file:line references.
- Show changes as a diff or the changed lines; never paste back a file you just wrote.
- Reuse existing helpers and patterns; ask before adding a dependency.
- Code: match the file's style; no dead, commented-out or debug code; comments only for a non-obvious why; handle errors at boundaries with actionable messages; precise types.
- Security: no secrets or personal data in code, logs or commits; parameterize queries; validate paths and URLs taken from input.
- Done means formatter, lint, typecheck and relevant tests pass. End with at most 5 lines: what changed and the command that verified it, or say it was not verified.
