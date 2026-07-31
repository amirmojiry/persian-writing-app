import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import {
  InMemorySessionRepository,
  type AudioCuePort,
  type ChildProfile,
  type SessionRepository,
  type WritingSession
} from '@persian-writing/core';
import { configureWritingServices, useWritingStore } from '../src/stores/writing';

class CloneCheckingRepository implements SessionRepository {
  private readonly inner = new InMemorySessionRepository();

  async saveProfile(profile: ChildProfile): Promise<void> {
    structuredClone(profile);
    await this.inner.saveProfile(profile);
  }

  listProfiles(): Promise<readonly ChildProfile[]> {
    return this.inner.listProfiles();
  }

  async saveSession(session: WritingSession): Promise<void> {
    structuredClone(session);
    await this.inner.saveSession(session);
  }

  findSession(id: string): Promise<WritingSession | null> {
    return this.inner.findSession(id);
  }

  findActiveSession(): Promise<WritingSession | null> {
    return this.inner.findActiveSession();
  }
}

const silentAudio: AudioCuePort = {
  async play() {},
  async stop() {}
};

describe('writing store persistence boundary', () => {
  it('persists a plain session snapshot after Pinia makes state reactive', async () => {
    setActivePinia(createPinia());
    configureWritingServices({
      repository: new CloneCheckingRepository(),
      audioCue: silentAudio
    });
    const store = useWritingStore();

    await store.initialize();
    await store.passWizard();
    await store.submitName('لیا');
    await expect(store.beginPractice()).resolves.toBeUndefined();

    expect(store.screen).toBe('practice');
    expect(store.session?.stage).toBe('practice');
  });
});
