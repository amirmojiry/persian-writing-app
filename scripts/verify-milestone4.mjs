import { readFile, readdir } from 'node:fs/promises';

const required = new Map([
  ['apps/desktop/src-tauri/src/database.rs', ['writing_sessions', 'find_active_session', '#[cfg(test)]']],
  ['apps/desktop/src-tauri/src/export_files.rs', ['write_export_file', 'cache_export_file', 'print_export']],
  ['apps/client/src/adapters/persistence/TauriSqliteSessionRepository.ts', ['save_profile', 'find_active_session']],
  ['apps/client/src/adapters/export/TauriResultDeliveryAdapter.ts', ['saveDialog', 'print_export', 'openPath']],
  ['apps/client/src/adapters/window/TauriWindowModeAdapter.ts', ['setFullscreen', 'setAlwaysOnTop']],
  ['apps/desktop/src-tauri/capabilities/default.json', ['dialog:allow-save', 'opener:allow-open-path', 'core:window:allow-set-fullscreen']],
  ['docs/DESKTOP_RELEASES.md', ['SQLite', 'Code signing', 'latest.json']],
  ['.github/workflows/desktop.yml', ['cargo test', 'tauri-apps/tauri-action']]
]);

for (const [path, needles] of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const needle of needles) {
    if (!content.includes(needle)) {
      throw new Error(`${path} is missing required Milestone 4 marker: ${needle}`);
    }
  }
}

for (const directory of ['packages/core/src', 'apps/client/src/components']) {
  for (const path of await filesBelow(new URL(`../${directory}/`, import.meta.url))) {
    const content = await readFile(path, 'utf8');
    if (content.includes('@tauri-apps/')) {
      throw new Error(`Tauri import leaked outside runtime adapters: ${path.pathname}`);
    }
  }
}

const rootPackage = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (rootPackage.version !== '0.6.0') {
  throw new Error(`Expected application version 0.6.0, received ${rootPackage.version}.`);
}

const tauriConfig = JSON.parse(await readFile(new URL('../apps/desktop/src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
if (tauriConfig.version !== '0.6.0' || tauriConfig.bundle?.active !== true) {
  throw new Error('Desktop bundle configuration is incomplete.');
}

console.log(`Milestone 4 verified: ${required.size} desktop implementation files and runtime boundaries.`);

async function filesBelow(directoryUrl) {
  const result = [];
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  for (const entry of entries) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    if (entry.isDirectory()) {
      result.push(...await filesBelow(child));
    } else if (/\.(ts|vue)$/u.test(entry.name)) {
      result.push(child);
    }
  }
  return result;
}
