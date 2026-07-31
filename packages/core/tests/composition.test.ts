import { describe, expect, it } from 'vitest';
import { createCompositionSvg, createWritingSession, startPractice, completeCurrentLetter } from '../src';

const stroke = [{ id: 's', points: [
  { x: 0, y: 0, t: 0, source: 'touch' as const },
  { x: 1, y: 1, t: 10, source: 'touch' as const }
] }];

describe('SVG composition', () => {
  it('renders logical RTL text and vector strokes without presentation forms', () => {
    const ready = createWritingSession({
      id: 'session',
      profileId: 'profile',
      logicalName: 'لی',
      now: '2026-07-31T09:00:00.000Z'
    });
    const first = completeCurrentLetter(startPractice(ready, ready.createdAt), stroke, ready.createdAt);
    const result = completeCurrentLetter(first, stroke, ready.createdAt);
    const svg = createCompositionSvg(result);

    expect(svg).toContain('direction="rtl"');
    expect(svg).toContain('>لی</text>');
    expect(svg).toContain('<path');
    expect(svg).not.toMatch(/[\uFB50-\uFDFF\uFE70-\uFEFF]/u);
  });
});
