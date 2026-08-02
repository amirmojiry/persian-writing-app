# Project status

Current milestone: 4 — complete
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

## Next task
Define and approve the next milestone before implementation. Accounts, OTP, consent-based synchronization, administration, camera input and Latin lesson packs remain outside version 0.6.0 and must not be started implicitly.

## Decisions pending
- Exact app/product name and final visual identity.
- Font packs beyond the current system/Vazirmatn fallback stack.
- Hosting provider beyond GitHub Pages and email service.
- Target platforms and signing providers for the first public desktop release.
- Whether and when account-based synchronization should be introduced.
