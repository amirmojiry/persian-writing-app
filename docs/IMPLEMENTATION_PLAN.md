# Token-efficient implementation plan

## Agent operating rules
- Implement exactly one milestone per task.
- Before coding, read only the files named by that milestone.
- Start by listing affected files and acceptance tests in at most 12 lines.
- Prefer modifying existing abstractions over adding parallel systems.
- Run targeted tests first, then the milestone test suite.
- Update `docs/STATUS.md` with completed acceptance criteria and next task.
- Do not rewrite lockfiles or formatting-only files unless required.
- Do not implement later milestones “while here”.

## Milestone 0 — Monorepo foundation
Deliver:
- pnpm workspace with Vue/TS/Vite client and shared packages.
- Tauri shell that loads production assets.
- Laravel API skeleton.
- lint, typecheck, Vitest, Pest, Playwright smoke test.
- CI for JS and PHP.

Acceptance:
- Client runs as web.
- Desktop development build opens the same client.
- API health endpoint passes Pest test.
- One command runs static checks and tests for each stack.

## Milestone 1 — Offline child flow with pointer drawing
Deliver:
- Wizard check, localized shell and audio cue abstraction.
- Local profile/name input with Persian on-screen keyboard.
- Session state machine.
- Pointer-based writing canvas.
- Unlimited-time Next flow.
- Final SVG composition and browser print.
- IndexedDB repository.

Acceptance:
- Entire activity works offline after first web load and in desktop build.
- Refresh/crash can resume an active session.
- Mouse, pen and touch use the same Pointer Events adapter.
- Persian name is logical Unicode and rendered RTL.

## Milestone 2 — Persian contextual forms
Deliver:
- Normalization and grapheme segmentation.
- Tested joining table and contextual-form algorithm.
- Tracing/reference modes.
- Guidelines and font settings.

Acceptance:
- Fixtures cover Persian letters, Arabic variants, ZWNJ, spaces and non-joining letters.
- امیر resolves to isolated/initial/medial/final as specified.
- Domain package has near-complete branch coverage for joining rules.

## Milestone 3 — Timing, polish and exports
Deliver:
- Timed mode with countdown/progress/both.
- Undo, clear, retry, stroke replay.
- Deterministic PNG/PDF output.
- Native/browser share capability detection and fallbacks.
- Child-friendly audio and reduced-motion behavior.

Acceptance:
- Fake-clock tests cover pause/resume/expiry.
- Export snapshot tests are deterministic.
- Unsupported share APIs never block download/print.

## Milestone 4 — Desktop persistence and packaging
Deliver:
- Tauri SQLite repository.
- Desktop print/share/file adapters.
- platform builds and update strategy documentation.
- kiosk mode.

Acceptance:
- Repository contract tests pass against IndexedDB and SQLite adapters.
- No Tauri imports occur in domain or generic Vue components.

## Milestone 5 — Authentication and sync
Deliver:
- Local anonymous profiles.
- Laravel 4-digit OTP flow with security controls.
- Sanctum token issuance for desktop.
- Sync outbox and idempotent batch endpoint.
- consent/privacy controls.

Acceptance:
- OTP expiry, throttling, attempt limits, replay and enumeration-resistant responses are tested.
- Offline sessions sync after reconnection.
- Privacy mode blocks queued dispatch immediately.

## Milestone 6 — Administration
Deliver:
- Local admin PIN/settings.
- Cloud admin authorization.
- Session filters, detail view, CSV/JSON export.
- external forwarding configuration and queue jobs.
- audit logs.

Acceptance:
- Non-admin access is denied by policy tests.
- Large exports run asynchronously.
- External forwarding honors consent and retries safely.

## Milestone 7 — Camera light-wand tracking
Deliver:
- Camera selection and permission UX.
- four-corner calibration.
- bright-point tracking worker.
- smoothing, perspective mapping and quality UI.
- camera input adapter.

Acceptance:
- Tracker algorithm is testable from recorded synthetic frame fixtures.
- Raw frames are not persisted by default.
- Loss of tracking pauses strokes rather than drawing jumps.

## Milestone 8 — Latin writing packs
Deliver:
- language/lesson-pack interface.
- Latin grapheme lessons and fonts.
- writing direction and baseline adaptations.

## Definition of done for every milestone
- Acceptance criteria pass.
- Unit/integration/E2E tests added for behavior, not implementation details.
- No unhandled TypeScript errors or PHP static-analysis failures.
- Database migrations are reversible.
- Public API/contracts documented.
- Localization keys exist in fa/en/fi.
- Privacy/security implications documented.
- `docs/STATUS.md` updated.
