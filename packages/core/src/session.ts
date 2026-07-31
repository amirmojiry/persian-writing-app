import type { Stroke, WritingSession } from './types';

export interface CreateWritingSessionInput {
  readonly id: string;
  readonly profileId: string;
  readonly logicalName: string;
  readonly now: string;
}

const JOIN_CONTROL_PATTERN = /[\u200C\u200D]/u;

export function normalizeLogicalName(input: string): string {
  return input
    .normalize('NFC')
    .replace(/[يى]/gu, 'ی')
    .replace(/ك/gu, 'ک')
    .trim()
    .replace(/\s+/gu, ' ');
}

export function segmentNameForPractice(input: string): readonly string[] {
  const normalized = normalizeLogicalName(input);
  const graphemes = typeof Intl.Segmenter === 'function'
    ? Array.from(new Intl.Segmenter('fa', { granularity: 'grapheme' }).segment(normalized), ({ segment }) => segment)
    : Array.from(normalized);

  return graphemes
    .flatMap((grapheme) => grapheme.split(JOIN_CONTROL_PATTERN))
    .filter((segment) => segment.length > 0 && !/^\s+$/u.test(segment));
}

export function createWritingSession(input: CreateWritingSessionInput): WritingSession {
  const logicalName = normalizeLogicalName(input.logicalName);
  const graphemes = segmentNameForPractice(logicalName);

  if (graphemes.length === 0) {
    throw new Error('A writing session requires at least one grapheme.');
  }

  return {
    id: input.id,
    profileId: input.profileId,
    logicalName,
    graphemes,
    stage: 'ready',
    status: 'active',
    currentIndex: 0,
    attempts: [],
    draftStrokes: [],
    createdAt: input.now,
    updatedAt: input.now
  };
}

export function startPractice(session: WritingSession, now: string): WritingSession {
  assertStage(session, 'ready');
  return {
    ...session,
    stage: 'practice',
    updatedAt: now
  };
}

export function updateDraftStrokes(
  session: WritingSession,
  strokes: readonly Stroke[],
  now: string
): WritingSession {
  assertStage(session, 'practice');
  return {
    ...session,
    draftStrokes: structuredClone(strokes),
    updatedAt: now
  };
}

export function completeCurrentLetter(
  session: WritingSession,
  strokes: readonly Stroke[],
  now: string
): WritingSession {
  assertStage(session, 'practice');
  if (strokes.length === 0) {
    throw new Error('At least one stroke is required before continuing.');
  }

  const grapheme = session.graphemes[session.currentIndex];
  if (grapheme === undefined) {
    throw new Error('The current grapheme does not exist.');
  }

  const attempt = {
    index: session.currentIndex,
    grapheme,
    strokes: structuredClone(strokes),
    completedAt: now
  } as const;
  const attempts = [
    ...session.attempts.filter((existing) => existing.index !== session.currentIndex),
    attempt
  ].sort((left, right) => left.index - right.index);
  const isLast = session.currentIndex >= session.graphemes.length - 1;

  return {
    ...session,
    stage: isLast ? 'result' : 'practice',
    status: isLast ? 'completed' : 'active',
    currentIndex: isLast ? session.currentIndex : session.currentIndex + 1,
    attempts,
    draftStrokes: [],
    updatedAt: now
  };
}

export function assertStage(session: WritingSession, expected: WritingSession['stage']): void {
  if (session.stage !== expected) {
    throw new Error(`Expected session stage ${expected}, received ${session.stage}.`);
  }
}
