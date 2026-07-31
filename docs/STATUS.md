# Project status

Current milestone: 3 — complete
Current application version: 0.5.1

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
- Timed practice is optional, configurable per letter and resumes from its persisted deadline after refresh.
- The child can undo the last stroke, clear the current letter or restart the current letter.
- Expired timed attempts lock the canvas and present a calm retry flow rather than advancing automatically.
- Result replay follows logical attempt order and recorded stroke durations.
- Reduced-motion preference skips progressive replay animation and shows the completed handwriting immediately.
- Result output is available as deterministic SVG, high-resolution PNG and PDF with the PNG embedded for stable Persian rendering.
- Web Share API is used when supported; unsupported sharing falls back to downloading the PNG locally.
- Milestone 3 actions include localized, child-friendly speech cues.
- New sessions use a cumulative full-name coordinate space instead of independent letter cells.
- Each step shows the growing Persian prefix, such as ا → ام → امی → امیر.
- Previously written strokes remain visible and locked while the next letter is written beside them.
- Display-only join control keeps an unfinished prefix in its correct contextual form without changing stored logical text.
- Final composition, PNG/PDF output and replay preserve the exact cumulative coordinates recorded during practice.
- Stored sessions created before version 0.5.1 remain readable through the legacy per-letter renderer.

## Milestone 3 acceptance evidence
- Core tests cover timed settings precedence, numeric limits and deterministic replay duration/order.
- Vue tests cover timed expiry/retry, undo, clear, replay and stable export file names.
- Persistence tests verify timed settings survive a new Pinia store and invalid JSON falls back safely.
- Playwright completes a timed Persian name activity, exercises undo/clear/retry, replays the result and downloads SVG, PNG and PDF.
- Playwright verifies unsupported Web Share falls back to a PNG download.
- Cumulative-layout tests verify `امیر` progresses through `ا`, `ام`, `امی`, `امیر` and retains completed strokes.
- Component tests verify Clear removes only the current-letter draft and leaves the completed prefix visible.
- Playwright verifies completed prefix strokes remain after advancing and after refreshing IndexedDB state.
- Cumulative SVG and replay tests verify recorded global coordinates are not shifted into artificial cells.
- Stored names and attempts remain NFC logical Unicode; presentation-form code points are not stored.
- JavaScript and PHP GitHub Actions pass for version 0.5.1.

## Next task
Implement Milestone 4 only: Tauri-native SQLite persistence, native save/print adapters, signed desktop installers, update strategy and kiosk/fullscreen behavior while keeping the web client operational.

## Decisions pending until implementation
- Exact app/product name and final visual identity.
- Font packs beyond the system/Vazirmatn fallback stack.
- Hosting provider beyond GitHub Pages and email service.
- Whether desktop targets include mobile in the first release.
