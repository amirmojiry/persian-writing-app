import { readFile } from 'node:fs/promises';

const required = new Map([
  ['packages/core/src/replay.ts', ['createReplayPlan', 'totalDurationMs']],
  ['apps/client/src/composables/usePracticeTimer.ts', ['persian-writing-timer-v1', 'remainingSeconds']],
  ['apps/client/src/composables/useReducedMotion.ts', ['prefers-reduced-motion']],
  ['apps/client/src/components/PracticeStep.vue', ['undo-stroke', 'clear-letter', 'retry-letter', 'timer-panel']],
  ['apps/client/src/components/ResultReplay.vue', ['stroke-replay', 'segmentProgress']],
  ['apps/client/src/adapters/export/BrowserResultExporter.ts', ['createPngBlob', 'createPdfBlob', 'createFile']],
  ['apps/client/src/adapters/export/BrowserResultDeliveryAdapter.ts', ['navigator.share', 'downloadFile']],
  ['apps/client/src/components/ResultStep.vue', ['download-png', 'download-pdf', 'share-result', 'replay-result']]
]);

for (const [path, needles] of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const needle of needles) {
    if (!content.includes(needle)) {
      throw new Error(`${path} is missing required Milestone 3 marker: ${needle}`);
    }
  }
}

const settings = await readFile(new URL('../packages/core/src/settings.ts', import.meta.url), 'utf8');
if (!settings.includes('timedMode') || !settings.includes('timeLimitSeconds')) {
  throw new Error('Milestone 3 timed settings are incomplete.');
}

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const [major, minor] = packageJson.version.split('.').map(Number);
if (major !== 0 || minor < 5) {
  throw new Error(`Expected Milestone 3 capabilities in version 0.5.0 or newer, received ${packageJson.version}.`);
}

const presentationForm = /[\uFB50-\uFDFF\uFE70-\uFEFF]/u;
for (const path of ['packages/core/src/replay.ts', 'apps/client/src/components/PracticeStep.vue']) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  if (presentationForm.test(content)) {
    throw new Error(`${path} contains Arabic presentation-form code points.`);
  }
}

console.log(`Milestone 3 verified: ${required.size} implementation files, exports, tools, replay and timer constraints.`);
