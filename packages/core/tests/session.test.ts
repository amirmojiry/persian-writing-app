import { describe, expect, it } from 'vitest';
import {
  completeCurrentLetter,
  createWritingSession,
  normalizeLogicalName,
  startPractice,
  updateDraftStrokes
} from '../src';

const firstStroke = [{
  id: 'stroke-1',
  points: [{ x: 0.1, y: 0.2, t: 0, source: 'mouse' as const }]
}];

describe('writing session state machine', () => {
  it('keeps logical NFC text and moves through the unlimited Next flow', () => {
    const session = createWritingSession({
      id: 'session-1',
      profileId: 'profile-1',
      logicalName: '  لی\u0650ا  ',
      now: '2026-07-31T09:00:00.000Z'
    });

    expect(session.logicalName).toBe(normalizeLogicalName('لی\u0650ا'));
    expect(session.stage).toBe('ready');

    const practicing = startPractice(session, '2026-07-31T09:01:00.000Z');
    const drafted = updateDraftStrokes(practicing, firstStroke, '2026-07-31T09:02:00.000Z');
    expect(drafted.draftStrokes).toHaveLength(1);

    const secondLetter = completeCurrentLetter(drafted, firstStroke, '2026-07-31T09:03:00.000Z');
    expect(secondLetter.stage).toBe('practice');
    expect(secondLetter.currentIndex).toBe(1);
    expect(secondLetter.draftStrokes).toEqual([]);
  });

  it('completes after the final grapheme', () => {
    const ready = createWritingSession({
      id: 'session-2',
      profileId: 'profile-1',
      logicalName: 'آ',
      now: '2026-07-31T09:00:00.000Z'
    });
    const result = completeCurrentLetter(
      startPractice(ready, '2026-07-31T09:01:00.000Z'),
      firstStroke,
      '2026-07-31T09:02:00.000Z'
    );

    expect(result.stage).toBe('result');
    expect(result.status).toBe('completed');
  });

  it('rejects invalid transitions and empty attempts', () => {
    const ready = createWritingSession({
      id: 'session-3',
      profileId: 'profile-1',
      logicalName: 'لیا',
      now: '2026-07-31T09:00:00.000Z'
    });

    expect(() => completeCurrentLetter(ready, firstStroke, '2026-07-31T09:01:00.000Z')).toThrow();
    expect(() => completeCurrentLetter(startPractice(ready, '2026-07-31T09:01:00.000Z'), [], '2026-07-31T09:02:00.000Z')).toThrow();
  });
});
