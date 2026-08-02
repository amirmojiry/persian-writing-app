# Project status

Current milestone: 5 — approved, not started
Current application version: 0.6.0

## Completed
- Product and architecture blueprint created.
- Milestone 0 monorepo foundation completed.
- Vue 3/TypeScript/Vite client, Tauri 2 shell and optional Laravel API are present.
- Milestone 1 child flow completed: wizard check, Persian name entry, readiness, practice and result.
- Mouse, pen and touch share one Pointer Events adapter.
- The browser application remains a static offline-first Vue SPA and stores profiles and sessions in IndexedDB.
- Active sessions and drafts resume after refresh or interruption.
- Persian Arabic-keyboard variants are canonicalized to logical Persian Unicode.
- Contextual isolated, initial, medial and final forms are derived from tested joining rules without storing presentation-form characters.
- Milestone 2 practice modes, guidelines, font selection and validated local settings are complete.
- Milestone 3 timed practice, undo, clear, retry, replay and deterministic SVG/PNG/PDF output are complete.
- New sessions use cumulative full-name coordinates, preserving the written prefix while the next letter is practiced.
- Web Share is used when supported and falls back to a local PNG download.
- Milestone 4 Tauri-native SQLite persistence is complete.
- Existing desktop IndexedDB profiles and sessions migrate once into SQLite without overwriting newer SQLite records.
- Desktop save dialogs, validated file writes, PDF printing and local open/share fallback are implemented behind runtime adapters.
- Desktop kiosk/fullscreen supports a visible exit path, `Ctrl+Shift+K`, `Escape` and `?kiosk=1` startup.
- Tauri capabilities are constrained to the required dialog, opener and window operations.
- Desktop application icon and bundle configuration are present.
- GitHub Actions validate JavaScript, PHP and Desktop/Rust changes.
- Manual runs and `desktop-v*` tags can build Windows, macOS and Linux bundles.
- Signing, notarization and updater prerequisites are documented in `docs/DESKTOP_RELEASES.md`.
- Automatic updates remain deliberately disabled until a Tauri updater signing key and release secrets are configured.
- All child names and stroke data remain local by default.

## Milestone 4 acceptance evidence
- `scripts/verify-milestone4.mjs` validates desktop implementation files, bundle version and runtime boundaries.
- Repository contract coverage exists for InMemory, IndexedDB and SQLite implementations.
- Migration tests cover one-time transfer from legacy desktop IndexedDB storage to SQLite.
- Rust tests cover SQLite schema setup and repository operations.
- Window adapter tests cover kiosk transitions and rollback behavior after partial failure.
- Result delivery tests cover native save, print and fallback behavior.
- JavaScript, PHP and Desktop workflows passed on the final Milestone 4 pull request.
- Pull request #8 was merged into `main` on 2026-08-02.

## Current release state
- Source version: `0.6.0`
- Web/PWA: operational through GitHub Pages and offline after the first successful load.
- Desktop development builds: operational with local SQLite persistence.
- Cross-platform installer workflow: configured.
- Public trusted signing/notarization: not yet configured.
- Automatic updater: documented but not enabled.

## Current milestone — Milestone 5: Authentication and sync

Milestone 5 introduces optional cloud identity and synchronization without making the existing child activity dependent on Laravel, an account or a network connection.

Planned milestone deliverables:
- Preserve anonymous local profiles with no cloud account requirement.
- Add a passwordless email login flow using a secure 4-digit OTP.
- Issue Laravel Sanctum tokens for authenticated desktop clients.
- Add a local sync outbox and an idempotent batch synchronization endpoint.
- Add explicit consent and privacy controls that govern every upload.
- Keep the web client a static offline-first Vue SPA.

Milestone acceptance criteria:
- OTP expiration, hashing, throttling, attempt limits, single use, replay prevention and enumeration-resistant responses are covered by tests.
- Completed offline sessions synchronize after connectivity returns and consent permits.
- Idempotency keys prevent duplicate server records when a batch is retried.
- Enabling privacy mode immediately blocks pending dispatch and marks affected outbox records accordingly.
- The full child writing flow still works without Laravel, login or connectivity.

## Immediate next implementation task

Implement the **Milestone 5 authentication foundation** before building synchronization:

1. Define shared authentication and consent contracts without importing Laravel or Tauri into domain code.
2. Add reversible Laravel migrations and models for OTP challenges, authenticated users/devices and the minimum profile ownership links required by Milestone 5.
3. Implement:
   - `POST /api/v1/auth/otp/request`
   - `POST /api/v1/auth/otp/verify`
   - `POST /api/v1/auth/logout`
   - `GET /api/v1/me`
4. Store only a hash/HMAC of the OTP; use a default 5-minute expiry, maximum 5 verification attempts, send/verify throttling by email and IP/device, and invalidate earlier active codes when a new one is issued.
5. Return generic request and verification responses to reduce email enumeration.
6. Issue a Sanctum token after successful verification for the desktop client; do not put tokens in normal application storage when an OS credential adapter is available.
7. Add Pest tests for success, expiry, wrong-code attempts, throttling, replay, replacement of an older code, logout and generic responses.
8. Document the authentication API contract and update generated/shared request types.

This task must not yet implement administration, camera input, Latin lesson packs or external data forwarding. Sync-outbox dispatch begins only after the authentication foundation and its tests are complete.

## Following Milestone 5 task

After the authentication foundation passes its acceptance tests, implement consent-aware synchronization:
- Persist `sync_outbox` records with idempotency keys and tombstones.
- Dispatch batches only while online and while the relevant consent snapshot permits upload.
- Implement `POST /api/v1/sync/batch` with per-item outcomes and safe retry behavior.
- Immediately block queued items when privacy mode is enabled.
- Verify offline creation, reconnection, retry and duplicate-batch behavior with integration tests.

## Decisions required before production deployment, not before local implementation
- Production email delivery provider and sender domain.
- Hosted API domain and environment configuration.
- Production token-revocation and device-management UX.
- Data retention periods for synchronized child profiles, sessions and learning events.
- Exact consent copy and any legal review required for child-related data.
- Target platforms and signing providers for the first public desktop release.
- Exact app/product name and final visual identity.
