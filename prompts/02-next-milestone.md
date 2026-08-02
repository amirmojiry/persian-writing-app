# Reusable next-milestone prompt

Implement the current milestone named in `docs/STATUS.md`.

Read:
- `.cursor/rules/project.mdc`
- `docs/STATUS.md`
- only the relevant sections of `docs/PRODUCT_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DATA_MODEL.md`, `docs/TEST_STRATEGY.md`
- the current milestone in `docs/IMPLEMENTATION_PLAN.md`

Before editing, provide a concise list of affected files and acceptance tests. Then implement only that milestone, run targeted tests followed by the required milestone checks, fix failures, and update `docs/STATUS.md`.

Do not implement later milestones. Record unresolved product decisions in STATUS instead of inventing behavior.
