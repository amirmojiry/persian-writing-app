import { readFile } from 'node:fs/promises';

const required = new Map([
  ['packages/core/src/types.ts', ['WritingLayout', 'cumulative-name']],
  ['packages/core/src/session.ts', ["writingLayout: 'cumulative-name'"]],
  ['packages/core/src/layout.ts', ['getPracticePrefix', 'getLockedPracticeStrokes']],
  ['packages/core/src/composition.ts', ['getSessionCompositionMetrics', 'createCumulativePaths']],
  ['packages/core/src/replay.ts', ['isCumulativeWritingSession']],
  ['apps/client/src/components/PracticeStep.vue', ['practice-prefix', 'locked-strokes', 'practiceGuide']],
  ['apps/client/src/components/WritingCanvas.vue', ['completed-child-stroke', 'data-writing-layout']],
  ['apps/client/src/assets/cumulative-writing.css', ['cumulative-reference', 'completed-child-stroke']]
]);

for (const [path, needles] of required) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  for (const needle of needles) {
    if (!content.includes(needle)) {
      throw new Error(`${path} is missing cumulative-writing marker: ${needle}`);
    }
  }
}

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
if (packageJson.version !== '0.5.1') {
  throw new Error(`Expected cumulative-writing hotfix version 0.5.1, received ${packageJson.version}.`);
}

const presentationForm = /[\uFB50-\uFDFF\uFE70-\uFEFF]/u;
for (const path of ['packages/core/src/layout.ts', 'apps/client/src/components/PracticeStep.vue']) {
  const content = await readFile(new URL(`../${path}`, import.meta.url), 'utf8');
  if (presentationForm.test(content)) {
    throw new Error(`${path} contains Arabic presentation-form code points.`);
  }
}

console.log(`Cumulative writing verified: ${required.size} implementation files and legacy-session compatibility.`);
