export type UiLocale = 'fa' | 'en' | 'fi';
export type SessionStage = 'ready' | 'practice' | 'result';
export type SessionStatus = 'active' | 'completed';
export type StrokeSource = 'mouse' | 'pen' | 'touch' | 'camera-light';
export type StrokeState = 'down' | 'move' | 'up';

export interface ChildProfile {
  readonly id: string;
  readonly displayName: string;
  readonly persianName: string;
  readonly uiLocale: UiLocale;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StrokePoint {
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly source: StrokeSource;
  readonly pressure?: number;
  readonly tiltX?: number;
  readonly tiltY?: number;
}

export interface Stroke {
  readonly id: string;
  readonly points: readonly StrokePoint[];
}

export interface LetterAttempt {
  readonly index: number;
  readonly grapheme: string;
  readonly strokes: readonly Stroke[];
  readonly completedAt: string;
}

export interface WritingSession {
  readonly id: string;
  readonly profileId: string;
  readonly logicalName: string;
  readonly graphemes: readonly string[];
  readonly stage: SessionStage;
  readonly status: SessionStatus;
  readonly currentIndex: number;
  readonly attempts: readonly LetterAttempt[];
  readonly draftStrokes: readonly Stroke[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
