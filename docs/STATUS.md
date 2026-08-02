# Project status

Current milestone: 6 — complete
Current application version: 0.8.0

## Completed foundation
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
- Milestone 4 Tauri-native SQLite persistence, native result delivery, kiosk mode and installer workflows are complete.
- Milestone 5 optional OTP authentication, Sanctum authorization, consent-aware outbox and idempotent synchronization are complete.
- All child names and stroke data remain local by default unless explicit account-sync consent is enabled.

## Milestone 6 delivered
- The client exposes an explicit Administration control in the normal header; there is no hidden administrator route.
- Local administrator mode is protected by a 6–12 digit PIN.
- Only a random salt and a PBKDF2-SHA-256 derivation with 120,000 iterations are stored; the PIN itself is never stored.
- Local administrators can define lesson defaults and lock selected lesson settings through the existing settings-precedence system.
- Privacy and synchronization consent are outside the lockable lesson-setting set and cannot be silently overridden.
- Cloud administrators are represented by a server-side `is_admin` role separate from ordinary authenticated users.
- Administrator authorization checks the server-side role even when a token contains an `admin` ability.
- Protected APIs provide filtered synchronized-session lists and session detail views.
- Session administration supports status, profile, date and pagination filters.
- Administrative session-list and detail access are written to an immutable audit-log table.
- CSV and JSON exports are created asynchronously through Laravel database queues rather than inside the HTTP request.
- Export records expose pending, processing, completed and failed states, record counts and error information.
- Export files are written to private local application storage.
- External forwarding supports encrypted bearer credentials, selected aggregate types, enable/disable state, maximum attempts and retry backoff.
- Every forwarding delivery checks the stored consent snapshot again before transmission.
- Profiles and sessions require `accountSync`; learning events additionally require `learningAnalytics` consent.
- Privacy-blocked deliveries are recorded as `blocked_privacy` and never sent.
- Failed forwarding requests use bounded delayed retries and remain visible as `retry_scheduled` or `failed` records.
- Forwarding configuration changes and export operations are audit logged.
- Administration UI strings are available in Persian, English and Finnish.
- Shared TypeScript contracts describe cloud-administration responses and forwarding configuration.
- The API, queue-worker requirement, authorization model and privacy rules are documented in `docs/API.md`.

## Milestone 6 acceptance evidence
- `scripts/verify-milestone6.mjs` verifies the administrator policy, protected APIs, queued jobs, migrations, local PIN service, UI, tests and documentation.
- Local administrator tests verify that the raw PIN is not stored, correct and incorrect PINs are handled, locked settings take precedence and privacy consent remains untouched.
- Pest policy tests prove that every non-administrator is denied, including a user carrying an `admin` token ability.
- Pest tests cover filtered session access, detail access and audit-log creation.
- Export tests prove that the request queues work, while file generation executes independently and produces deterministic private CSV output.
- Forwarding tests prove that no HTTP request occurs without consent and that eligible failures create bounded retry state.
- PHP validation passes 11 tests with 76 assertions plus Larastan.
- JavaScript validation passes all milestone verifiers, lint, typecheck, unit tests, production build and Playwright E2E.
- Desktop validation covers the production web build, Rust formatting, `cargo check` and SQLite/export command tests.

## Current release state
- Source version: `0.8.0`
- Web/PWA: remains offline-first after the initial successful load.
- Desktop development builds: retain local SQLite persistence and native result delivery.
- Local administrator mode: operational without Laravel or connectivity.
- Cloud administration: implemented and requires a configured Laravel API, database and administrator account.
- Asynchronous exports and forwarding: require a running Laravel queue worker, normally `php artisan queue:work`.
- Optional account sync and external forwarding remain disabled unless explicitly configured and consented.
- Production email delivery, hosted API configuration, retention policy and final legal consent copy are not yet configured.
- Public trusted desktop signing/notarization and automatic updates remain separate release-operations work.

## Immediate next task — Milestone 7

Define and approve Milestone 7 before implementation. The next blueprint area is camera/light-wand input, but it must begin with a narrow technical spike covering:
- explicit camera permission and privacy behavior;
- frame-processing boundaries that do not alter the existing pointer/stroke domain model;
- device/browser support and a tested non-camera fallback;
- performance budgets for local processing;
- a milestone-specific acceptance plan.

Do not begin Latin lesson packs or production deployment work as part of that spike.

## Decisions required before production deployment
- Production email delivery provider and sender domain.
- Hosted API domain and environment configuration.
- Queue-worker process supervision and failure alerting.
- Persistent desktop token storage through an OS credential adapter.
- Data retention periods for synchronized child profiles, sessions, exports, audit logs and forwarding deliveries.
- Exact consent copy and any required legal review for child-related data.
- Target platforms and signing providers for the first public desktop release.
- Exact app/product name and final visual identity.
