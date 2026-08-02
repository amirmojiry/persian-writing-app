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

export type ResultFileFormat = 'svg' | 'png' | 'pdf';

export interface ResultFile {
  readonly name: string;
  readonly mimeType: string;
  readonly format: ResultFileFormat;
  readonly bytes: Uint8Array;
}

export type FileDeliveryOutcome = 'saved' | 'cancelled' | 'shared' | 'opened' | 'printed';

export interface ResultDeliveryPort {
  readonly runtime: 'browser' | 'desktop';
  save(file: ResultFile): Promise<FileDeliveryOutcome>;
  print(file: ResultFile): Promise<FileDeliveryOutcome>;
  share(file: ResultFile): Promise<FileDeliveryOutcome>;
}

export interface WindowModePort {
  readonly available: boolean;
  isKiosk(): Promise<boolean>;
  setKiosk(enabled: boolean): Promise<void>;
}

export type AudioCue =
  | 'wizardPrompt'
  | 'wizardSuccess'
  | 'ready'
  | 'nextLetter'
  | 'complete'
  | 'timerWarning'
  | 'timeUp'
  | 'undo'
  | 'clear'
  | 'retry'
  | 'replay';

export interface AudioCuePort {
  play(cue: AudioCue, locale: ChildProfile['uiLocale']): Promise<void>;
  stop(): Promise<void>;
}
