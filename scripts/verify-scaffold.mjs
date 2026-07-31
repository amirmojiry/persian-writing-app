import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import assert from 'node:assert/strict';

const required = [
  'pnpm-workspace.yaml',
  'apps/client/package.json',
  'apps/client/src/App.vue',
  'apps/desktop/src-tauri/tauri.conf.json',
  'apps/api/composer.json',
  'apps/api/routes/api.php',
  'packages/core/src/index.ts',
  '.github/workflows/javascript.yml',
  '.github/workflows/php.yml'
];

for (const path of required) {
  await access(new URL(`../${path}`, import.meta.url), constants.R_OK);
}

const clientPackage = JSON.parse(
  await readFile(new URL('../apps/client/package.json', import.meta.url), 'utf8')
);
assert.equal(clientPackage.dependencies.vue.startsWith('^3.'), true);

const tauriConfig = JSON.parse(
  await readFile(new URL('../apps/desktop/src-tauri/tauri.conf.json', import.meta.url), 'utf8')
);
assert.equal(tauriConfig.build.frontendDist, '../../client/dist');

const apiRoute = await readFile(new URL('../apps/api/routes/api.php', import.meta.url), 'utf8');
assert.match(apiRoute, /api\/health|\/health/);

console.log(`Scaffold verified: ${required.length} required files and contracts.`);
