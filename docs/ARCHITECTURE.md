# Architecture

## 1. Repository layout
```text
apps/
  client/                 # Vue SPA; builds for web/PWA and Tauri
  desktop/                # Tauri Rust shell and desktop adapters
  api/                    # Laravel API, optional for offline operation
packages/
  core/                   # Framework-independent TypeScript domain logic
  ui/                     # Shared Vue components
  i18n/                   # fa/en/fi messages and audio cue manifest
  lesson-persian/         # joining rules and curated lesson metadata
  contracts/              # JSON Schema / OpenAPI generated types
  test-fixtures/
docs/
```

Use a pnpm workspace. Laravel remains a normal Composer project inside `apps/api`.

## 2. Why not Inertia
Inertia requires Laravel to render/serve application responses. A desktop app that launches without PHP or a local web server must use a static SPA. The Laravel service is therefore a remote/optional API. Existing Laravel knowledge remains useful for API, queues, admin and exports, but Inertia is intentionally excluded from the client.

## 3. Frontend layers
- Presentation: Vue components and route pages.
- Application: use cases such as `StartSession`, `RecordStroke`, `CompleteLesson`.
- Domain: name normalization, grapheme segmentation, joining analysis, session state machine.
- Ports: repositories, share/export, input, audio, clock and sync interfaces.
- Adapters: IndexedDB, Tauri SQLite, browser share, Tauri native share/print, pointer, camera tracker.

Do not import Tauri APIs directly in Vue components. Resolve adapters at bootstrap from runtime capabilities.

## 4. Core interfaces
```ts
export interface InputAdapter {
  readonly id: 'pointer' | 'camera-light' | 'hid';
  start(target: StrokeTarget): Promise<void>;
  stop(): Promise<void>;
  onPoint(listener: (point: StrokePoint) => void): Unsubscribe;
  onStrokeState(listener: (state: 'down' | 'move' | 'up') => void): Unsubscribe;
}

export interface SessionRepository {
  create(session: WritingSession): Promise<void>;
  save(session: WritingSession): Promise<void>;
  find(id: string): Promise<WritingSession | null>;
  list(filter: SessionFilter): Promise<Page<WritingSessionSummary>>;
}

export interface ExportService {
  renderPng(result: Composition): Promise<Blob>;
  renderPdf(result: Composition): Promise<Blob>;
  print(result: Composition): Promise<void>;
  share(file: Blob, metadata: ShareMetadata): Promise<ShareResult>;
}
```

## 5. Persian shaping model
Store logical Unicode text, never presentation-form code points, in user data.

Create a joining table for Persian/Arabic letters:
```ts
type JoiningType = 'dual' | 'right' | 'non' | 'transparent';
interface LetterInfo {
  char: string;
  joiningType: JoiningType;
  normalizedFrom?: string[];
}
```

For each letter, derive:
```ts
type ContextualForm = 'isolated' | 'initial' | 'medial' | 'final';

function contextualForm(chars: string[], i: number): ContextualForm {
  const joinsPrev = canJoin(chars[i - 1], chars[i]);
  const joinsNext = canJoin(chars[i], chars[i + 1]);
  if (joinsPrev && joinsNext) return 'medial';
  if (joinsPrev) return 'final';
  if (joinsNext) return 'initial';
  return 'isolated';
}
```

Display contextual examples using normal text shaping in a browser canvas/SVG or curated SVG lesson glyphs. Do not persist Unicode Arabic Presentation Forms.

Use `Intl.Segmenter` when available and a tested fallback to segment grapheme clusters. Normalize with NFC and map Arabic variants to configured Persian canonical forms where appropriate (`ي→ی`, `ك→ک`) while preserving an audit field containing the original input.

## 6. Stroke data
Store normalized coordinates so sessions are resolution-independent:
```ts
interface StrokePoint {
  x: number;       // 0..1
  y: number;       // 0..1
  t: number;       // ms from lesson start
  pressure?: number;
  tiltX?: number;
  tiltY?: number;
  source: 'mouse' | 'pen' | 'touch' | 'camera-light';
}
interface Stroke { id: string; points: StrokePoint[]; }
```

Render with SVG paths or Canvas. Keep domain stroke data independent from rendering technology. Smooth only for display; preserve raw points or a compressed raw representation for metrics.

## 7. Persistence
### Web
IndexedDB using a thin repository adapter. Cache static assets through a service worker. Do not cache authenticated API responses indiscriminately.

### Desktop
SQLite via a Tauri plugin/command adapter. Store secrets in an OS credential store. Use an application data directory for exports and cached packs.

### Synchronization
Use an outbox table:
- Every syncable local mutation writes an outbox record in the same logical transaction.
- A background sync worker sends batches when online and consent permits.
- Requests use idempotency keys.
- Server returns per-item status.
- Use tombstones for deletions.
- Privacy toggle immediately prevents dispatch.

## 8. Laravel API
Suggested modules:
- Auth OTP.
- Devices and profiles.
- Sessions and lesson-event ingestion.
- Admin search/export.
- Settings/defaults.
- External webhook/export jobs.

Use Sanctum personal access tokens for desktop clients and same-site cookie authentication for the hosted SPA when served under compatible domains. Use queues for email, exports and external forwarding.

OTP requirements:
- Store only HMAC/hash of code.
- 5-minute expiry by default.
- Maximum 5 attempts.
- Rate limit send and verify endpoints by email and IP/device.
- Invalidate prior active code when issuing a new one.
- Return generic responses to reduce email enumeration.

## 9. API outline
```text
POST /api/v1/auth/otp/request
POST /api/v1/auth/otp/verify
POST /api/v1/auth/logout
GET  /api/v1/me

GET  /api/v1/settings/defaults
PUT  /api/v1/settings/me

POST /api/v1/sync/batch
GET  /api/v1/admin/sessions
POST /api/v1/admin/exports
GET  /api/v1/admin/exports/{id}
```

Publish an OpenAPI document and generate TypeScript clients. Avoid hand-maintained duplicated request types.

## 10. Export/rendering
Create a deterministic SVG composition first. Use it as the canonical render tree for:
- Browser print view.
- PNG rendering.
- PDF generation.
- Share preview.

Embed or outline only fonts with compatible licenses. Include metadata such as child display name only when consent allows.

## 11. Security
- Strict Content Security Policy for desktop and hosted web.
- Tauri allowlist/capabilities limited to required commands.
- Validate imported lesson/font packs and reject executable content.
- Escape all localized/admin content.
- CSRF protection for cookie-authenticated web requests.
- Authorization policies on every admin endpoint.
- Audit administrator exports and data access.
