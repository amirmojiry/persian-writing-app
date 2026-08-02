# Authentication, synchronization and administration API

Base path: `/api/v1`

The API is optional. The complete child-writing flow remains available without an account, Laravel, administrator access or connectivity.

## Request OTP

`POST /api/v1/auth/otp/request`

```json
{"email":"adult@example.com","deviceId":"local-device-uuid"}
```

The endpoint always returns a generic response. Codes contain exactly four digits, are stored only as a hash, expire after five minutes by default, are single-use and permit at most five verification attempts. Sending is throttled by normalized email, IP and device. Requesting a new code consumes older active challenges.

## Verify OTP

`POST /api/v1/auth/otp/verify`

```json
{"email":"adult@example.com","code":"1234","deviceId":"local-device-uuid","deviceName":"Family laptop"}
```

A normal user receives a Sanctum token with the `sync` ability. A user whose server-side `is_admin` flag is true receives `sync` and `admin` abilities, and the response includes `isAdmin`. The role remains enforced by the administrator policy even if a token is accidentally given the `admin` ability.

## Current user and logout

- `GET /api/v1/me`
- `POST /api/v1/auth/logout`

Both require `Authorization: Bearer <token>`. Logout revokes only the current token.

## Synchronize a batch

`POST /api/v1/sync/batch`

Requires a Sanctum token with the `sync` ability. Each request supports up to 100 items.

```json
{
  "items": [{
    "idempotencyKey": "00000000-0000-4000-8000-000000000001",
    "aggregateType": "session",
    "aggregateId": "00000000-0000-4000-8000-000000000002",
    "operation": "upsert",
    "payload": {"status":"completed"},
    "consentSnapshot": {"accountSync":true,"learningAnalytics":false,"capturedAt":"2026-08-02T10:00:00Z"}
  }]
}
```

Per-item outcomes are `accepted`, `duplicate`, `blocked_privacy` or `failed`. The authenticated-user/idempotency-key pair is unique. An item without account-sync consent is never persisted. Eligible newly accepted records create forwarding jobs for enabled endpoints; the forwarding job performs its own consent check again before transmission.

## Administration authorization

All `/api/v1/admin/*` endpoints require authentication and a server-side administrator account. Non-administrator users receive HTTP 403, including users carrying a token that lists an `admin` ability. Administrative list access, detail access, export requests and forwarding changes are written to `admin_audit_logs`.

## Session list and detail

- `GET /api/v1/admin/sessions`
- `GET /api/v1/admin/sessions/{sessionId}`

The list supports `status`, `profileId`, `from`, `to`, `page` and `perPage` filters. `perPage` is limited to 100. Results are sourced only from synchronized `session` records; local-only child data remains invisible to the cloud administrator.

## Asynchronous exports

- `POST /api/v1/admin/exports`
- `GET /api/v1/admin/exports/{exportId}`

Create request:

```json
{"format":"csv","filters":{"status":"completed","from":"2026-08-01"}}
```

The create endpoint returns HTTP 202 with status `pending`; it does not build the file inside the request. `BuildAdminExport` runs through Laravel's database queue and writes a CSV or JSON file to private local storage. Poll the detail endpoint for `pending`, `processing`, `completed` or `failed`, the record count and failure information. Production deployments must run a queue worker, for example `php artisan queue:work`.

## External forwarding

- `GET /api/v1/admin/forwarding`
- `PUT /api/v1/admin/forwarding`

Configuration includes an HTTPS endpoint, optional encrypted bearer secret, enabled state, aggregate types, maximum attempts and retry backoff. Secrets are encrypted at rest and omitted from API serialization. The overview includes recent `failed` and `retry_scheduled` deliveries for operational visibility.

Forwarding rules:

- `accountSync` consent is required for every aggregate.
- An `event` also requires `learningAnalytics` consent.
- Disabled endpoints or excluded aggregate types are not sent.
- Delivery uses the synchronized item's idempotency key.
- Failed requests retry with bounded increasing delay and become `failed` after the configured maximum.
- Privacy-blocked deliveries are recorded as `blocked_privacy` and never sent.

## Local administrator mode

The static Vue client exposes an explicit Administration control; there is no hidden route. The first adult creates a 6–12 digit PIN. The client stores only a salted PBKDF2-SHA-256 derivation with 120,000 iterations. After unlocking, an administrator can set device defaults and lock selected lesson settings. Setting precedence remains user override → administrator default → application default, except locked administrator lesson settings. Privacy and synchronization consent are outside the lockable lesson-setting set and can never be silently overridden.

## Client privacy behavior

- Account synchronization is disabled by default.
- Local profile and session writes create outbox records, but records created without consent are marked `blocked_privacy`.
- Enabling privacy/local-only mode immediately blocks all unsent records.
- Dispatch occurs only while online, authenticated and explicitly consented.
- The bearer token is kept in memory; it is not written to localStorage.
- Local administrator settings do not require the API and do not make child activity network-dependent.
