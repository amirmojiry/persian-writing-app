# Test strategy

## Coverage policy
Do not optimize solely for a percentage. Require high coverage on deterministic domain code and risk-based tests on integration boundaries.

Recommended thresholds:
- `packages/core` and `lesson-persian`: 95% statements/lines/functions, 90% branches.
- Vue client overall: 85% statements/lines/functions, 80% branches.
- Laravel application code: 90% lines for services/actions/policies; exclude framework bootstrap and generated files.

## TypeScript tests
### Unit
- Name normalization and canonicalization.
- Grapheme segmentation.
- Persian joining/contextual forms using table-driven fixtures.
- Session state transitions and invalid transitions.
- Timer with fake clock.
- Stroke metrics, normalization, smoothing and composition layout.
- Setting precedence and locked defaults.
- Consent and outbox eligibility.

### Component
- On-screen Persian keyboard.
- Wizard check with pointer and keyboard.
- Canvas interactions using synthetic PointerEvents.
- Timer display variants.
- RTL/LTR layout and locale switching.
- Capability fallbacks for share/print.

### Repository contract tests
Run the same suite against:
- in-memory adapter.
- IndexedDB adapter.
- Tauri SQLite adapter where environment permits.

### E2E
Playwright scenarios:
- Complete Persian name offline.
- Resume interrupted session.
- Switch UI locale without changing writing language.
- Timed lesson expiry and retry.
- Export/print preview.
- Privacy mode blocking sync.
- Admin settings precedence.

## Laravel/Pest tests
- OTP request/verify happy path.
- Expired, wrong, replayed and too-many-attempt codes.
- Send/verify throttling.
- Generic response for unknown/known email.
- Sanctum token scope/ability tests.
- Sync batch idempotency and partial failures.
- Consent enforcement.
- Admin policies and audit logs.
- Export job and external-forwarding retries.
- Validation fuzz/boundary cases for event payloads.

## Camera tracker tests
Keep image processing independent from browser UI. Feed synthetic frames or small licensed fixtures into a pure tracker module. Test noise, multiple bright points, occlusion, perspective mapping, sudden jumps and loss/reacquisition.

## Visual and accessibility tests
- Screenshot checks for key fa/en/fi pages at desktop/tablet sizes.
- Automated accessibility checks plus manual keyboard and screen-reader review for adult flows.
- Verify large touch targets and reduced-motion mode.
