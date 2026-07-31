import { describe, expect, it } from 'vitest';
import { createReplayPlan, type WritingSession } from '../src';

const session: WritingSession = {
  id: 'session-1',
  profileId: 'profile-1',
  logicalName: 'لی',
  graphemes: ['ل', 'ی'],
  stage: 'result',
  status: 'completed',
  currentIndex: 1,
  attempts: [
    {
      index: 0,
      grapheme: 'ل',
      completedAt: '2026-07-31T18:00:00.000Z',
      strokes: [{
        id: 'stroke-a',
        points: [
          { x: 0.1, y: 0.2, t: 100, source: 'pen' },
          { x: 0.5, y: 0.7, t: 700, source: 'pen' }
        ]
      }]
    },
    {
      index: 1,
      grapheme: 'ی',
      completedAt: '2026-07-31T18:00:01.000Z',
      strokes: [{
        id: 'stroke-b',
        points: [
          { x: 0.2, y: 0.3, t: 0, source: 'touch' },
          { x: 0.7, y: 0.8, t: 200, source: 'touch' }
        ]
      }]
    }
  ],
  draftStrokes: [],
  createdAt: '2026-07-31T17:59:00.000Z',
  updatedAt: '2026-07-31T18:00:01.000Z'
};

describe('stroke replay plan', () => {
  it('keeps logical stroke order while positioning letters right to left', () => {
    const plan = createReplayPlan(session, { gapMs: 100 });

    expect(plan.segments).toHaveLength(2);
    expect(plan.segments[0]?.id).toBe('0-stroke-a');
    expect(plan.segments[0]?.path).toContain('M 278');
    expect(plan.segments[0]?.durationMs).toBe(600);
    expect(plan.segments[1]?.startsAtMs).toBe(700);
    expect(plan.totalDurationMs).toBe(900);
  });

  it('clamps very short and very long recorded durations', () => {
    const plan = createReplayPlan(session, {
      minimumStrokeMs: 300,
      maximumStrokeMs: 500,
      gapMs: 0
    });

    expect(plan.segments.map((segment) => segment.durationMs)).toEqual([500, 300]);
    expect(plan.totalDurationMs).toBe(800);
  });
});
