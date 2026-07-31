# Project status

Current milestone: 2 — in progress
Current application version: 0.3.0

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
- GitHub Pages publishes the production web client.
- Persian Arabic-keyboard variants ي/ى and ك are canonicalized to logical Persian ی and ک.
- A tested joining table now covers the 32 Persian letters and the common آ/أ/إ/ؤ/ئ variants.
- Practice letters are classified as isolated, initial, medial or final from their actual logical neighbors.
- Spaces and ZWNJ break joining, while ZWNJ is not presented as a practice letter.
- The canvas reference and letter bubble display the contextual form without persisting Arabic presentation-form code points.

## Milestone 2 contextual-form acceptance evidence
- `بابا` resolves to initial/final/initial/final.
- `کتاب` resolves to initial/medial/final/isolated.
- `ایران` resolves to isolated/initial/final/isolated/isolated.
- `لیا` resolves to initial/medial/final.
- Unit tests cover the complete form table, Arabic keyboard variants, spaces and ZWNJ.
- Vue component tests cover initial, medial and final reference rendering.
- Playwright verifies the contextual forms while completing and resuming a name.
- Stored names and attempts remain NFC logical Unicode; presentation-form code points are not stored.

## Environment validation note
- Dependency-backed Vite/Vitest/Playwright/Tauri execution runs in GitHub Actions.

## Next task within Milestone 2
Implement the remaining Milestone 2 scope only: tracing/reference modes and configurable guidelines/font settings.

## Decisions pending until implementation
- Exact app/product name and final visual identity.
- Font packs beyond the system/Vazirmatn fallback stack.
- Hosting provider beyond GitHub Pages and email service.
- Whether desktop targets include mobile in the first release.
