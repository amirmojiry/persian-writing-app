export type UiLocale = 'fa' | 'en' | 'fi';
export type SessionStage = 'ready' | 'practice' | 'result';
export type SessionStatus = 'active' | 'completed';
export type StrokeSource = 'mouse' | 'pen' | 'touch' | 'camera-light';
export type StrokeState = 'down' | 'move' | 'up';
export type WritingLayout = 'legacy-letter-cells' | 'cumulative-name';

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
  /**
   * Sessions created before v0.5.1 omit this value and keep the legacy
   * per-letter coordinate system so previously stored work remains readable.
   */
  readonly writingLayout?: WritingLayout;
  readonly stage: SessionStage;
  readonly status: SessionStatus;
  readonly currentIndex: number;
  readonly attempts: readonly LetterAttempt[];
  readonly draftStrokes: readonly Stroke[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
