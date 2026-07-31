# Project status

Current milestone: 2 — ready to start
Current application version: 0.2.0

## Completed
- Product and architecture blueprint created.
- Milestone 0 monorepo foundation completed.
- Vue 3/TypeScript/Vite client, Tauri 2 shell and optional Laravel API are present.
- Milestone 1 child flow completed: wizard check, Persian name entry, readiness, practice and result.
- Mouse, pen and touch share one Pointer Events adapter.
- Normalized vector strokes and active sessions persist locally through IndexedDB.
- Refresh or crash resumes the active letter and previously completed/draft strokes.
- Final handwriting is composed into deterministic RTL SVG and can be printed in the browser.
- UI strings for Milestone 1 exist in Persian, English and Finnish.
- Browser speech is isolated behind the audio cue port and is optional.
- Static assets are precached for offline use after the first successful load.
- GitHub Pages deployment is configured for the web client.

## Milestone 1 acceptance evidence
- Offline child flow has no Laravel or network dependency.
- Logical NFC Unicode is stored; Arabic presentation-form code points are not persisted.
- Session state, pointer normalization, SVG composition and repository contracts have behavior tests.
- Playwright scenarios cover completing a Persian name and resuming after refresh from IndexedDB.
- Static architectural checks and dependency-independent runtime checks pass locally.
- Full Vue/Vitest/Playwright builds are required to pass in GitHub Actions.

## Environment validation note
- This execution environment has no package-registry access or Rust toolchain.
- Dependency-backed Vite/Vitest/Playwright/Tauri execution runs in GitHub Actions.

## Next task
Implement Milestone 2 only: Persian normalization variants, grapheme segmentation fixtures, tested joining table, contextual forms, tracing/reference modes and configurable guidelines/font settings.

## Decisions pending until implementation
- Exact app/product name and final visual identity.
- Font packs beyond the system/Vazirmatn fallback stack.
- Hosting provider beyond GitHub Pages and email service.
- Whether desktop targets include mobile in the first release.
