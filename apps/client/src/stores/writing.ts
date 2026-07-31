import { defineStore } from 'pinia';
import {
  completeCurrentLetter,
  createWritingSession,
  normalizeLogicalName,
  resolveLessonSettings,
  startPractice,
  updateDraftStrokes,
  type AudioCue,
  type AudioCuePort,
  type ChildProfile,
  type LessonSettings,
  type SessionRepository,
  type Stroke,
  type UiLocale,
  type WritingSession
} from '@persian-writing/core';
import { BrowserSpeechAudioCue } from '@/adapters/audio/BrowserSpeechAudioCue';
import { createSessionRepository } from '@/adapters/persistence/createSessionRepository';

export type FlowScreen = 'wizard' | 'name' | 'ready' | 'practice' | 'result';

interface WritingState {
  initialized: boolean;
  locale: UiLocale;
  screen: FlowScreen;
  session: WritingSession | null;
  profiles: readonly ChildProfile[];
  lessonSettings: LessonSettings;
  resumed: boolean;
  errorMessage: string | null;
}

const LESSON_SETTINGS_STORAGE_KEY = 'persian-writing-lesson-settings-v1';
let repository: SessionRepository = createSessionRepository();
let audioCue: AudioCuePort = new BrowserSpeechAudioCue();

export function configureWritingServices(services: {
  readonly repository?: SessionRepository;
  readonly audioCue?: AudioCuePort;
}): void {
  repository = services.repository ?? repository;
  audioCue = services.audioCue ?? audioCue;
}

export const useWritingStore = defineStore('writing', {
  state: (): WritingState => ({
    initialized: false,
    locale: readSavedLocale(),
    screen: 'wizard',
    session: null,
    profiles: [],
    lessonSettings: readSavedLessonSettings(),
    resumed: false,
    errorMessage: null
  }),

  getters: {
    currentGrapheme(state): string {
      if (state.session === null) {
        return '';
      }
      return state.session.graphemes[state.session.currentIndex] ?? '';
    },
    progress(state): { readonly current: number; readonly total: number } {
      return {
        current: state.session === null ? 0 : state.session.currentIndex + 1,
        total: state.session?.graphemes.length ?? 0
      };
    }
  },

  actions: {
    async initialize(): Promise<void> {
      if (this.initialized) {
        return;
      }
      try {
        this.profiles = await repository.listProfiles();
        const activeSession = await repository.findActiveSession();
        if (activeSession !== null) {
          this.session = activeSession;
          this.screen = activeSession.stage;
          const profile = this.profiles.find((candidate) => candidate.id === activeSession.profileId);
          if (profile !== undefined) {
            this.locale = profile.uiLocale;
          }
          this.resumed = true;
        }
      } catch (error: unknown) {
        this.errorMessage = error instanceof Error ? error.message : 'Local storage could not be opened.';
      } finally {
        this.initialized = true;
      }
    },

    setLocale(locale: UiLocale): void {
      this.locale = locale;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('persian-writing-locale', locale);
      }
    },

    updateLessonSettings(patch: Partial<LessonSettings>): void {
      this.lessonSettings = resolveLessonSettings({
        userOverrides: {
          ...this.lessonSettings,
          ...patch
        }
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LESSON_SETTINGS_STORAGE_KEY, JSON.stringify(this.lessonSettings));
      }
    },

    async passWizard(): Promise<void> {
      this.screen = 'name';
      await this.playCue('wizardSuccess');
    },

    async submitName(input: string): Promise<void> {
      const persianName = normalizeLogicalName(input);
      if (persianName.length === 0) {
        return;
      }
      const now = new Date().toISOString();
      const existing = this.profiles.find((profile) => profile.persianName === persianName);
      const profile: ChildProfile = existing === undefined
        ? {
            id: createId(),
            displayName: persianName,
            persianName,
            uiLocale: this.locale,
            createdAt: now,
            updatedAt: now
          }
        : {
            ...existing,
            uiLocale: this.locale,
            updatedAt: now
          };
      const session = createWritingSession({
        id: createId(),
        profileId: profile.id,
        logicalName: persianName,
        now
      });
      await repository.saveProfile(profile);
      await repository.saveSession(session);
      this.profiles = await repository.listProfiles();
      this.session = session;
      this.screen = 'ready';
      this.resumed = false;
      await this.playCue('ready');
    },

    async beginPractice(): Promise<void> {
      if (this.session === null) {
        return;
      }
      this.session = startPractice(this.session, new Date().toISOString());
      this.screen = 'practice';
      await repository.saveSession(createPersistentSessionSnapshot(this.session));
      await this.playCue('nextLetter');
    },

    async saveDraft(strokes: readonly Stroke[]): Promise<void> {
      if (this.session === null || this.session.stage !== 'practice') {
        return;
      }
      this.session = updateDraftStrokes(this.session, strokes, new Date().toISOString());
      await repository.saveSession(createPersistentSessionSnapshot(this.session));
    },

    async completeLetter(strokes: readonly Stroke[]): Promise<void> {
      if (this.session === null) {
        return;
      }
      this.session = completeCurrentLetter(this.session, strokes, new Date().toISOString());
      this.screen = this.session.stage;
      await repository.saveSession(createPersistentSessionSnapshot(this.session));
      await this.playCue(this.session.stage === 'result' ? 'complete' : 'nextLetter');
    },

    startAgain(): void {
      this.session = null;
      this.screen = 'name';
      this.resumed = false;
    },

    async playCue(cue: AudioCue): Promise<void> {
      await audioCue.play(cue, this.locale);
    }
  }
});

function createPersistentSessionSnapshot(session: WritingSession): WritingSession {
  return {
    ...session,
    graphemes: [...session.graphemes],
    attempts: session.attempts.map((attempt) => ({
      ...attempt,
      strokes: cloneStrokes(attempt.strokes)
    })),
    draftStrokes: cloneStrokes(session.draftStrokes)
  };
}

function cloneStrokes(strokes: readonly Stroke[]): Stroke[] {
  return strokes.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map((point) => ({ ...point }))
  }));
}

function readSavedLocale(): UiLocale {
  if (typeof localStorage === 'undefined') {
    return 'fa';
  }
  const value = localStorage.getItem('persian-writing-locale');
  return value === 'en' || value === 'fi' || value === 'fa' ? value : 'fa';
}

function readSavedLessonSettings(): LessonSettings {
  if (typeof localStorage === 'undefined') {
    return resolveLessonSettings();
  }

  const saved = localStorage.getItem(LESSON_SETTINGS_STORAGE_KEY);
  if (saved === null) {
    return resolveLessonSettings();
  }

  try {
    return resolveLessonSettings({ userOverrides: JSON.parse(saved) as Partial<LessonSettings> });
  } catch {
    localStorage.removeItem(LESSON_SETTINGS_STORAGE_KEY);
    return resolveLessonSettings();
  }
}

function createId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
