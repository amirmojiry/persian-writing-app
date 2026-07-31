import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';

const required = ['apps/client/src/components/WizardStep.vue','apps/client/src/components/NameEntryStep.vue','apps/client/src/components/WritingCanvas.vue','apps/client/src/components/ResultStep.vue','apps/client/src/adapters/input/PointerInputAdapter.ts','apps/client/src/adapters/persistence/IndexedDbSessionRepository.ts','apps/client/public/sw.js','packages/core/src/session.ts','packages/core/src/composition.ts','packages/core/tests/session.test.ts'];
for (const path of required) await access(new URL(`../${path}`, import.meta.url), constants.R_OK);
const pointerAdapter = await readFile(new URL('../apps/client/src/adapters/input/PointerInputAdapter.ts', import.meta.url), 'utf8');
assert.match(pointerAdapter, /pointerdown/); assert.match(pointerAdapter, /pointermove/); assert.match(pointerAdapter, /pointerup/); assert.doesNotMatch(pointerAdapter, /@tauri-apps/);
const repository = await readFile(new URL('../apps/client/src/adapters/persistence/IndexedDbSessionRepository.ts', import.meta.url), 'utf8');
assert.match(repository, /indexedDB\.open/);
const session = await readFile(new URL('../packages/core/src/session.ts', import.meta.url), 'utf8');
assert.match(session, /normalize\('NFC'\)/); assert.doesNotMatch(session, /[\uFB50-\uFDFF\uFE70-\uFEFF]/u);
console.log(`Milestone 1 verified: ${required.length} required implementation files and architectural constraints.`);
