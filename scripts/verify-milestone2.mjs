import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'packages/core/src/settings.ts',
  'packages/lesson-persian/src/contextualForms.ts',
  'apps/client/src/components/PracticeSettingsPanel.vue',
  'apps/client/src/components/PracticeStep.vue',
  'apps/client/src/components/WritingCanvas.vue',
  'apps/client/src/assets/practice-settings.css'
];

const contents = new Map();
for (const path of requiredFiles) {
  contents.set(path, await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

assertIncludes('packages/core/src/settings.ts', [
  "'trace' | 'reference'",
  "'baseline' | 'three-line' | 'grid' | 'none'",
  'resolveLessonSettings',
  'lockedByAdministrator'
]);
assertIncludes('apps/client/src/components/PracticeSettingsPanel.vue', [
  'mode-trace',
  'mode-reference',
  'guideline-style',
  'sample-font'
]);
assertIncludes('apps/client/src/components/WritingCanvas.vue', [
  'trace-reference',
  'guideline-layer',
  'baselinePosition',
  'guidelineOpacity',
  'guidelineThickness'
]);

const presentationForms = /[\uFB50-\uFDFF\uFE70-\uFEFF]/u;
for (const [path, content] of contents) {
  if (presentationForms.test(content)) {
    throw new Error(`${path} contains an Arabic presentation-form code point.`);
  }
}

console.log(`Milestone 2 verified: ${requiredFiles.length} contextual-form and practice-setting files.`);

function assertIncludes(path, tokens) {
  const content = contents.get(path);
  if (content === undefined) {
    throw new Error(`Missing required file: ${path}`);
  }
  for (const token of tokens) {
    if (!content.includes(token)) {
      throw new Error(`${path} is missing required token: ${token}`);
    }
  }
}
