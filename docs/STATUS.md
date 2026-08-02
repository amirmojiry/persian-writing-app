# Project status

Current milestone: 5 — complete
Current application version: 0.7.0

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
- Milestone 4 Tauri-native SQLite persistence, native result delivery, kiosk mode and installer workflows are complete.
- Milestone 5 optional authentication and consent-aware synchronization are complete.
- All child names and stroke data remain local by default unless explicit account-sync consent is enabled.

## Milestone 5 delivered
- Anonymous local profiles and the complete child-writing flow still work without an account, Laravel or connectivity.
- Passwordless email authentication uses a four-digit OTP with hashed storage, five-minute default expiry, single use, attempt limits and send/verify throttling.
- Issuing a new OTP consumes earlier active challenges and API responses avoid revealing whether an email already exists.
- Successful verification creates a Laravel Sanctum token restricted to the `sync` ability.
- Authenticated endpoints provide the current user, logout and idempotent batch synchronization.
- Shared TypeScript contracts describe OTP, authentication, consent and sync payloads.
- Local profile and session mutations create outbox records in IndexedDB.
- Outbox dispatch occurs only when the device is online, a valid token is present and the consent snapshot permits account synchronization.
- Retried batches cannot create duplicate server records because each authenticated user/idempotency-key pair is unique.
- Disabling account synchronization immediately marks unsent outbox records as `blocked_privacy`.
- The client exposes localized privacy, OTP sign-in and sign-out controls in Persian, English and Finnish.
- Bearer tokens remain in memory rather than normal web storage; persistent desktop sign-in still requires a future OS credential-store adapter.
- The authentication and sync API is documented in `docs/API.md`.

## Milestone 5 acceptance evidence
- `scripts/verify-milestone5.mjs` checks the required authentication, consent, outbox, API and documentation boundaries.
- Core tests cover offline behavior, successful/duplicate outcomes and immediate privacy blocking.
- IndexedDB tests verify dispatchable outbox persistence and privacy blocking.
- Pest tests cover OTP hashing, expiry, wrong-code limits, replay prevention, replacement, generic responses, logout and idempotent consent-aware synchronization.
- Larastan validates the Laravel implementation.
- Existing JavaScript, browser E2E and desktop/Rust checks continue to protect the offline child flow and runtime boundaries.

## Current release state
- Source version: `0.7.0`
- Web/PWA: remains offline-first after the initial successful load.
- Desktop development builds: retain local SQLite persistence.
- Optional account sync: implemented, disabled by default and requires a configured API and mail provider.
- Production email delivery, hosted API configuration and legal consent copy are not yet configured.
- Public trusted desktop signing/notarization and automatic updates remain separate release-operations work.

## Next task — Milestone 6: Administration

Implement Milestone 6 only after this status is merged:
- Add a protected local administrator mode with a PIN or OS-secure equivalent; do not use a hidden route.
- Add cloud administrator authorization policies separate from normal users.
- Add session filtering and detail views.
- Add asynchronous CSV and JSON export jobs for large datasets.
- Add configurable external forwarding with consent checks, retries and failure visibility.
- Add audit logs for administrator data access, exports and forwarding changes.

Milestone 6 acceptance criteria:
- Policy tests deny all non-administrator access.
- Large exports run asynchronously rather than blocking requests.
- External forwarding never sends data without the relevant consent snapshot and retries safely.
- Local child activity remains operational without admin access, the API or a network.

Do not begin camera light-wand tracking or Latin lesson packs while implementing Milestone 6.

## Decisions required before production deployment
- Production email delivery provider and sender domain.
- Hosted API domain and environment configuration.
- Persistent desktop token storage through an OS credential adapter.
- Data retention periods for synchronized child profiles, sessions and learning events.
- Exact consent copy and any required legal review for child-related data.
- Target platforms and signing providers for the first public desktop release.
- Exact app/product name and final visual identity.
