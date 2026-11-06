---
name: plan-interview
description: "Interviews the user one question at a time until a plan or design has no open decisions. Use only when the user asks for it."
---

# Plan interview

1. Restate the goal in one line and list the open decisions as a dependency tree, with decisions that unblock others first.
2. Before asking, try to settle each decision from the code, the docs or earlier answers. Ask only what remains.
3. Ask exactly one question per turn. Offer 2-4 options, the recommended one first, each with its trade-off in one line.
4. After each answer, update a running decision log (decision, choice, reason) and move to the next open decision. Revisit an earlier decision only if a new answer contradicts it.
5. Stop when no decision is open or the user says stop. Output the final decision log and the remaining risks in at most 15 lines.
