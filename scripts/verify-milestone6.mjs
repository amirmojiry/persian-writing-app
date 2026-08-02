import { readFile } from 'node:fs/promises';

const required = new Map([
  ['apps/api/app/Policies/AdminPolicy.php', ['is_admin', 'access']],
  ['apps/api/app/Http/Controllers/AdminController.php', ['admin.sessions.list', 'BuildAdminExport::dispatch', 'admin.forwarding.save']],
  ['apps/api/app/Jobs/BuildAdminExport.php', ['ShouldQueue', 'admin-exports', 'status']],
  ['apps/api/app/Jobs/ForwardSyncedItem.php', ['blocked_privacy', 'retry_scheduled', 'ShouldQueue']],
  ['apps/api/database/migrations/2026_08_02_010000_create_milestone6_admin_tables.php', ['admin_audit_logs', 'admin_exports', 'forwarding_deliveries', 'public function down']],
  ['apps/client/src/services/localAdminService.ts', ['PBKDF2', '120_000', 'LocalAdminSettings']],
  ['apps/client/src/components/AdminPanel.vue', ['verifyLocalAdminPin', 'createExport', 'saveForwarding']],
  ['apps/api/tests/Feature/AdminTest.php', ['non-administrator', 'queues large exports', 'without consent']],
  ['docs/API.md', ['/api/v1/admin/sessions', '/api/v1/admin/exports', '/api/v1/admin/forwarding']]
]);

for (const [path, markers] of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) throw new Error(`${path} is missing Milestone 6 marker: ${marker}`);
  }
}

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (packageJson.version !== '0.8.0') throw new Error(`Expected version 0.8.0, received ${packageJson.version}.`);

console.log(`Milestone 6 verified: ${required.size} administration, export and forwarding files.`);
