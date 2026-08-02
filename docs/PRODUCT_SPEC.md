# Product specification

## 1. Product goal
Create a child-friendly application that teaches a child to write their own name. The child enters or selects the correct spelling of the name, sees each contextual letter form in sequence, writes each letter using a mouse, stylus, touch input, or a tracked illuminated wand, and receives a printable/shareable final composition containing the handwriting and a typeset version.

## 2. Product principles
- Child-first: minimal reading, large targets, audio guidance, forgiving interaction.
- Adult-assisted setup: transliteration confirmation, device calibration, privacy, exports.
- Offline-first: the complete writing activity works without a server or account.
- Privacy by default: local logging only unless explicit consent enables sync.
- Deterministic Persian shaping: never infer contextual forms from screenshots.
- Accessible: keyboard navigation for adults, high contrast, reduced motion, captions.
- Localizable: UI locale and writing language are separate settings.

## 3. Primary user flow
### 3.1 Magic check
Show a playful checkbox inspired by “Are you human?” with the text “Are you a wizard?”. Play an optional localized voice prompt. Support pointer, touch, stylus and tracked-wand activation. On success, play a brief positive response. Do not imitate a real CAPTCHA brand or security flow.

### 3.2 Name entry
Offer:
- On-screen Persian keyboard, independent of OS keyboard installation.
- Latin input with transliteration suggestions.
- Adult confirmation screen listing candidates.
- Manual Persian editing for unusual names.
- Saved child profiles for repeat sessions.

Transliteration is advisory. The adult-confirmed Persian spelling is authoritative.

### 3.3 Readiness transition
Show an animated, localized “Ready?” screen with audio and a large start action. Respect reduced-motion settings.

### 3.4 Letter-by-letter practice
For each Unicode grapheme/letter in the confirmed name:
- Resolve its correct contextual Persian/Arabic presentation form from neighboring joining behavior.
- Show either tracing mode or reference-beside-canvas mode.
- Render baseline/guidelines according to settings.
- Capture vector strokes with timestamps and input metadata.
- Allow undo, clear, replay stroke, and next.
- Use either unlimited time with a Next button or a configured timer.
- Timer display modes: countdown, progress bar, or both.
- Never auto-discard work when time expires; mark timeout and allow adult-configured continue/retry behavior.

Example for امیر:
- ا: isolated because Alef does not join to the following letter.
- م: initial form, joined to the following letter.
- ی: medial form, joined from both sides.
- ر: final form, joined from the previous letter and not to a following letter.

### 3.5 Final composition
Combine letter canvases into a single right-to-left handwritten name using recorded bounding boxes, baseline alignment and configurable spacing. Also show the correctly typeset name. Permit:
- Print.
- Save/export as PNG and PDF.
- Native share where available.
- Email through server when online, or `mailto:` fallback without attachment guarantees.
- WhatsApp/Telegram via OS share sheet or download-and-share instructions; do not depend on undocumented APIs.

## 4. Input modes
### Pointer input
Use Pointer Events as the common abstraction for mouse, pen/stylus and touch. Capture pointer type, pressure where available, tilt where available, coordinates and timestamps.

### Illuminated wand input
A physical light wand used on a wall or board is not inherently a pointer device. Support it as a separate camera-tracking mode:
1. Camera permission and device selection.
2. Four-point calibration of the writing surface.
3. Bright-point/color threshold calibration.
4. Frame-by-frame centroid detection.
5. Perspective transformation to canvas coordinates.
6. Pen-down heuristic based on brightness/visibility and configurable dwell.
7. Smoothing and outlier rejection.
8. Visible tracking-quality indicator.

Implement this after pointer-based MVP. Keep the tracker behind an `InputAdapter` interface.

## 5. Languages
MVP UI locales:
- Persian (`fa`, RTL)
- English (`en`, LTR)
- Finnish (`fi`, LTR)

Writing languages:
- MVP: Persian.
- Later: Latin-script languages using the same grapheme lesson pipeline.

All user-visible strings and audio cue identifiers must come from localization resources. No hard-coded UI text.

## 6. Typography
- Bundle only fonts whose licenses permit redistribution.
- Default Persian UI font: Vazirmatn.
- Separate font choices for UI, lesson sample, and final typeset output.
- Provide a font manifest with script support, license, source, and embedding permission.
- Traditional/Nastaliq fonts are optional plugins/packs. Test shaping and line metrics before enabling.
- Never treat font glyph outlines as pedagogically correct stroke order unless a curated lesson asset exists.

## 7. Settings hierarchy
Effective setting = user override → administrator default → application default.

Settings include:
- UI locale and writing language.
- Input mode.
- Tracing/reference mode.
- Timer enabled, duration, presentation, expiry behavior.
- Guideline style, opacity, thickness and baseline position.
- Sample font, UI font and output font.
- Stroke width, smoothing and pointer pressure behavior.
- Audio, animation and celebration intensity.
- Data retention and synchronization consent.
- Camera calibration profile.

## 8. Profiles and authentication
### Local profile
A child/adult can enter a display name and use the app without email. Generate a local UUID. No cloud identity is implied.

### Email account
Use passwordless email login with a 4-digit one-time code, expiration, single use, rate limiting, attempt limits and hashed storage. Four digits provide limited entropy, so compensate with short expiry and strict throttling. Do not use Laravel’s verification-link flow as the OTP implementation.

### Roles
- Child/user.
- Local administrator for device configuration.
- Cloud administrator for cross-device logs and exports.

Protect local admin with a PIN or OS-level secure storage, not a hidden route.

## 9. Logging and analytics
Record detailed learning events locally:
- Session ID, profile ID/pseudonym, app version, platform and locale.
- Name text only when consent permits; otherwise store a salted hash and character metadata.
- Lesson index, base character, contextual form, mode and input adapter.
- Start/end time, active duration, pauses, timeout, retries, undo/clear count.
- Stroke count, point count, path length, bounding box, pressure summary and tracking-quality summary.
- Completion/export/share actions.
- Configuration snapshot relevant to interpretation.

Avoid raw camera frames by default. If diagnostic capture is enabled, require explicit adult consent and automatic expiry.

## 10. Privacy
- Default mode: local only.
- Separate consent for account sync, learning analytics and diagnostic camera data.
- Current-profile privacy toggle blocks future external uploads and queues deletion/cancellation of pending uploads.
- Provide export and delete-my-data actions.
- Minimize children’s personal data. Use child nickname/profile ID where possible.
- Document retention periods and administrator access.

## 11. Administrator capabilities
- Manage defaults and lock selected settings.
- View/filter sessions and lesson metrics.
- Export CSV and JSON; optionally ZIP session assets.
- Configure an external sync endpoint, credentials, batching and retry policy.
- See sync status and failures.
- Manage font/lesson packs.
- Never silently override a user privacy choice.

## 12. Additional recommended features
- Adult setup mode separated from child mode.
- Demo profile and guided calibration.
- Session resume after crash or app close.
- Stroke replay animation.
- Optional letter-order and direction hints based on curated lesson assets.
- Positive feedback independent of handwriting “correctness” in MVP.
- Later handwriting similarity scoring as an opt-in research feature, not a pass/fail gate.
- Kiosk/fullscreen mode for museums, schools and events.
- Multiple children on one device.
- Offline audio packs.
- Data schema versioning and migration support.

## 13. Non-goals for MVP
- Automatic grading of handwriting quality.
- General OCR of arbitrary Persian handwriting.
- Perfect automatic Latin-to-Persian transliteration.
- Camera/light-wand tracking.
- Cross-device cloud synchronization.
- Latin writing lessons.
