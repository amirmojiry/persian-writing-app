import type { Stroke, WritingSession } from './types';

export function isCumulativeWritingSession(session: WritingSession): boolean {
  return session.writingLayout === 'cumulative-name';
}

export function getPracticePrefix(session: WritingSession): string {
  const lastIndex = Math.min(session.currentIndex, session.graphemes.length - 1);
  return session.graphemes.slice(0, lastIndex + 1).join('');
}

export function getLockedPracticeStrokes(session: WritingSession): readonly Stroke[] {
  if (!isCumulativeWritingSession(session)) {
    return [];
  }

  return session.attempts
    .filter((attempt) => attempt.index < session.currentIndex)
    .sort((left, right) => left.index - right.index)
    .flatMap((attempt) => cloneStrokes(attempt.strokes));
}

export function getCompletedSessionStrokes(session: WritingSession): readonly Stroke[] {
  return session.attempts
    .slice()
    .sort((left, right) => left.index - right.index)
    .flatMap((attempt) => cloneStrokes(attempt.strokes));
}

function cloneStrokes(strokes: readonly Stroke[]): Stroke[] {
  return strokes.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map((point) => ({ ...point }))
  }));
}
