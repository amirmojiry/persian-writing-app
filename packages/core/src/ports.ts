import type { ChildProfile, StrokePoint, StrokeState, WritingSession } from './types';

export type Unsubscribe = () => void;

export interface InputAdapter<TTarget = unknown> {
  readonly id: 'pointer' | 'camera-light' | 'hid';
  start(target: TTarget): Promise<void>;
  stop(): Promise<void>;
  onPoint(listener: (point: StrokePoint) => void): Unsubscribe;
  onStrokeState(listener: (state: StrokeState) => void): Unsubscribe;
}

export interface SessionRepository {
  saveProfile(profile: ChildProfile): Promise<void>;
  listProfiles(): Promise<readonly ChildProfile[]>;
  saveSession(session: WritingSession): Promise<void>;
  findSession(id: string): Promise<WritingSession | null>;
  findActiveSession(): Promise<WritingSession | null>;
}

export type AudioCue = 'wizardPrompt' | 'wizardSuccess' | 'ready' | 'nextLetter' | 'complete';

export interface AudioCuePort {
  play(cue: AudioCue, locale: ChildProfile['uiLocale']): Promise<void>;
  stop(): Promise<void>;
}
