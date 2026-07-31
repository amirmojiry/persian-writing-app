import { describe, expect, it } from 'vitest';
import {
  completeCurrentLetter,
  createCompositionSvg,
  createReplayPlan,
  createWritingSession,
  getLockedPracticeStrokes,
  getPracticePrefix,
  getSessionCompositionMetrics,
  isCumulativeWritingSession,
  startPractice,
  type Stroke,
  type WritingSession
} from '../src';

const firstStroke: readonly Stroke[] = [{
  id: 'alef',
  points: [
    { x: 0.82, y: 0.2, t: 0, source: 'touch' },
    { x: 0.82, y: 0.72, t: 120, source: 'touch' }
  ]
}];

const secondStroke: readonly Stroke[] = [{
  id: 'mim',
  points: [
    { x: 0.67, y: 0.52, t: 0, source: 'touch' },
    { x: 0.58, y: 0.6, t: 160, source: 'touch' }
  ]
}];

describe('cumulative name writing layout', () => {
  it('creates new sessions in one shared name coordinate space', () => {
    const ready = createWritingSession({
      id: 'session-amir',
      profileId: 'profile',
      logicalName: 'امیر',
      now: '2026-07-31T20:00:00.000Z'
    });

    expect(isCumulativeWritingSession(ready)).toBe(true);
    expect(ready.writingLayout).toBe('cumulative-name');
    expect(getPracticePrefix(ready)).toBe('ا');

    const secondStep = completeCurrentLetter(
      startPractice(ready, ready.createdAt),
      firstStroke,
      ready.createdAt
    );

    expect(getPracticePrefix(secondStep)).toBe('ام');
    expect(getLockedPracticeStrokes(secondStep)).toEqual(firstStroke);
  });

  it('overlays all completed letters at their recorded global positions', () => {
    const ready = createWritingSession({
      id: 'session-am',
      profileId: 'profile',
      logicalName: 'ام',
      now: '2026-07-31T20:00:00.000Z'
    });
    const first = completeCurrentLetter(startPractice(ready, ready.createdAt), firstStroke, ready.createdAt);
    const result = completeCurrentLetter(first, secondStroke, ready.createdAt);
    const svg = createCompositionSvg(result);
    const replay = createReplayPlan(result);
    const metrics = getSessionCompositionMetrics(result);

    expect(metrics.width).toBe(1072);
    expect(svg).toContain('M 856 156');
    expect(svg).toContain('M 706 348');
    expect(replay.segments[0]?.path).toContain('M 856 156');
    expect(replay.segments[1]?.path).toContain('M 706 348');
  });

  it('keeps stored sessions without layout metadata on the legacy renderer', () => {
    const legacy: WritingSession = {
      id: 'legacy',
      profileId: 'profile',
      logicalName: 'لی',
      graphemes: ['ل', 'ی'],
      stage: 'result',
      status: 'completed',
      currentIndex: 1,
      attempts: [
        { index: 0, grapheme: 'ل', strokes: firstStroke, completedAt: '2026-07-31T20:00:00.000Z' },
        { index: 1, grapheme: 'ی', strokes: secondStroke, completedAt: '2026-07-31T20:00:01.000Z' }
      ],
      draftStrokes: [],
      createdAt: '2026-07-31T20:00:00.000Z',
      updatedAt: '2026-07-31T20:00:01.000Z'
    };

    expect(isCumulativeWritingSession(legacy)).toBe(false);
    expect(getLockedPracticeStrokes(legacy)).toEqual([]);
    expect(getSessionCompositionMetrics(legacy).width).toBe(512);
  });
});
