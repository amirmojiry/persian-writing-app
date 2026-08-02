# Bootstrap prompt for Cursor/Codex

You are implementing Milestone 0 of this repository.

Read only:
- README.md
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md (Milestone 0 and Definition of Done)
- adr/ADR-001-stack.md
- .cursor/rules/project.mdc

Then:
1. Propose the exact repository tree and commands in at most 12 lines.
2. Bootstrap the pnpm workspace, Vue 3 TypeScript Vite app, shared packages, Tauri 2 shell and Laravel API skeleton.
3. Add strict lint/typecheck/test commands and minimal CI.
4. Add one web/desktop smoke page and one Laravel `/api/health` endpoint.
5. Add Vitest, Playwright and Pest smoke tests.
6. Run the relevant checks and fix failures.
7. Update docs/STATUS.md.

Constraints:
- Do not implement product screens yet.
- Do not use Inertia.
- Do not add authentication or a database schema beyond framework defaults.
- Do not introduce Docker unless the environment requires it and document why.
- Keep generated commentary minimal; perform edits directly.
