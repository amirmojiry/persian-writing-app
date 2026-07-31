# Project status

Current milestone: 2 — complete
Current application version: 0.4.0

## Completed
- Product and architecture blueprint created.
- Milestone 0 monorepo foundation completed.
- Vue 3/TypeScript/Vite client, Tauri 2 shell and optional Laravel API are present.
- Milestone 1 child flow completed: wizard check, Persian name entry, readiness, practice and result.
- Mouse, pen and touch share one Pointer Events adapter.
- Normalized vector strokes and active sessions persist locally through IndexedDB.
- Refresh or crash resumes the active letter and previously completed/draft strokes.
- Final handwriting is composed into deterministic RTL SVG and can be printed in the browser.
- UI strings exist in Persian, English and Finnish.
- Browser speech is isolated behind the audio cue port and is optional.
- Static assets are precached for offline use after the first successful load.
- GitHub Pages publishes the production web client.
- Persian Arabic-keyboard variants ي/ى and ك are canonicalized to logical Persian ی and ک.
- A tested joining table covers the 32 Persian letters and common آ/أ/إ/ؤ/ئ variants.
- Practice letters are classified as isolated, initial, medial or final from their logical neighbors.
- Spaces and ZWNJ break joining, while ZWNJ is not presented as a practice letter.
- The canvas reference and letter bubble display contextual forms without persisting presentation-form code points.
- Practice supports trace-on-sample and reference-beside-canvas modes.
- Guideline style, opacity, thickness and baseline position are configurable.
- The sample font can be selected independently from the UI font.
- Lesson settings are validated, stored locally and restored after refresh.
- Settings resolution supports application defaults, administrator defaults, locked administrator values and user overrides.

## Milestone 2 acceptance evidence
- `بابا` resolves to initial/final/initial/final.
- `کتاب` resolves to initial/medial/final/isolated.
- `ایران` resolves to isolated/initial/final/isolated/isolated.
- `لیا` resolves to initial/medial/final.
- Unit tests cover the complete form table, Arabic keyboard variants, spaces, ZWNJ and settings precedence.
- Vue tests cover contextual rendering, tracing/reference modes, guideline variants and settings controls.
- Persistence tests verify validated settings survive a new Pinia store and invalid JSON falls back safely.
- Playwright verifies settings are applied and retained after refresh in Chromium.
- Stored names and attempts remain NFC logical Unicode; presentation-form code points are not stored.
- JavaScript and PHP GitHub Actions pass for version 0.4.0.

## Next task
Implement Milestone 3 only: timed mode, undo/clear/retry, stroke replay, deterministic PNG/PDF output, share capability fallbacks, child-friendly audio and reduced-motion behavior.

## Decisions pending until implementation
- Exact app/product name and final visual identity.
- Font packs beyond the system/Vazirmatn fallback stack.
- Hosting provider beyond GitHub Pages and email service.
- Whether desktop targets include mobile in the first release.
