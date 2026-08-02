import { readFile } from 'node:fs/promises';

const required = new Map([
  ['apps/api/app/Services/OtpService.php', ['Hash::make', 'addMinutes', 'attempts', 'consumed_at']],
  ['apps/api/app/Http/Controllers/AuthController.php', ['otp-send:', 'otp-verify:', 'createToken']],
  ['apps/api/app/Http/Controllers/SyncController.php', ['idempotencyKey', 'blocked_privacy', 'duplicate']],
  ['apps/api/database/migrations/2026_08_02_000000_create_milestone5_tables.php', ['otp_challenges', 'personal_access_tokens', 'synced_items', 'public function down']],
  ['packages/core/src/sync.ts', ['ConsentSnapshot', 'SyncCoordinator', 'blockAllForPrivacy']],
  ['apps/client/src/adapters/sync/IndexedDbSyncOutboxRepository.ts', ['SYNC_OUTBOX_STORE', 'blockAllForPrivacy']],
  ['apps/client/src/components/PrivacySyncPanel.vue', ['setAccountSyncConsent', 'requestOtp', 'verifyOtp']],
  ['apps/api/tests/Feature/AuthSyncTest.php', ['expired', 'replayed', 'idempotently']],
  ['docs/API.md', ['/api/v1/auth/otp/request', '/api/v1/sync/batch']]
]);

for (const [path, markers] of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) throw new Error(`${path} is missing Milestone 5 marker: ${marker}`);
  }
}

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (packageJson.version !== '0.7.0') throw new Error(`Expected version 0.7.0, received ${packageJson.version}.`);

console.log(`Milestone 5 verified: ${required.size} authentication, consent and sync files.`);
