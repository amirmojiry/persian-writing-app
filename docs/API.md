# Authentication and synchronization API

Base path: `/api/v1`

The API is optional. The complete child-writing flow remains available without an account, Laravel or connectivity.

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

A successful response contains the user and a Sanctum bearer token with the `sync` ability. Invalid, expired, consumed and attempt-limited codes use the same generic error.

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

Per-item outcomes are `accepted`, `duplicate`, `blocked_privacy` or `failed`. The pair of authenticated user and idempotency key is unique, so retrying the same batch cannot create duplicate records. An item without account-sync consent is never persisted.

## Client privacy behavior

- Account synchronization is disabled by default.
- Local profile and session writes create outbox records, but records created without consent are marked `blocked_privacy`.
- Enabling privacy/local-only mode immediately blocks all unsent records.
- Dispatch occurs only while online, authenticated and explicitly consented.
- The bearer token is kept in memory; it is not written to localStorage. Desktop production deployments should add an OS credential-store adapter before persistent sign-in is enabled.
