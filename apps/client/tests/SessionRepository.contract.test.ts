import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import {
  InMemorySessionRepository,
  createWritingSession,
  startPractice,
  type ChildProfile,
  type SessionRepository,
  type WritingSession
} from '@persian-writing/core';
import { IndexedDbSessionRepository } from '../src/adapters/persistence/IndexedDbSessionRepository';

repositoryContract('InMemorySessionRepository', () => new InMemorySessionRepository());
repositoryContract(
  'IndexedDbSessionRepository',
  () => new IndexedDbSessionRepository(`persian-writing-contract-${crypto.randomUUID()}`)
);

function repositoryContract(name: string, createRepository: () => SessionRepository): void {
  describe(name, () => {
    it('saves profiles and lists the newest update first', async () => {
      const repository = createRepository();
      await repository.saveProfile(profile('profile-a', 'امیر', '2026-07-31T18:00:00.000Z'));
      await repository.saveProfile(profile('profile-b', 'لیا', '2026-07-31T18:02:00.000Z'));

      const profiles = await repository.listProfiles();
      expect(profiles.map((item) => item.id)).toEqual(['profile-b', 'profile-a']);
    });

    it('finds a session by id and returns only the newest active session', async () => {
      const repository = createRepository();
      const older = activeSession('session-old', '2026-07-31T18:01:00.000Z');
      const newer = activeSession('session-new', '2026-07-31T18:04:00.000Z');
      const completed: WritingSession = {
        ...activeSession('session-completed', '2026-07-31T18:05:00.000Z'),
        stage: 'result',
        status: 'completed'
      };
      await repository.saveSession(older);
      await repository.saveSession(completed);
      await repository.saveSession(newer);

      expect((await repository.findSession('session-completed'))?.status).toBe('completed');
      expect((await repository.findActiveSession())?.id).toBe('session-new');
      expect(await repository.findSession('missing')).toBeNull();
    });

    it('replaces an existing profile and session snapshot by id', async () => {
      const repository = createRepository();
      await repository.saveProfile(profile('profile-a', 'امیر', '2026-07-31T18:00:00.000Z'));
      await repository.saveProfile(profile('profile-a', 'امیر', '2026-07-31T19:00:00.000Z'));
      const session = activeSession('session-a', '2026-07-31T18:00:00.000Z');
      await repository.saveSession(session);
      await repository.saveSession({ ...session, currentIndex: 1, updatedAt: '2026-07-31T19:00:00.000Z' });

      expect(await repository.listProfiles()).toHaveLength(1);
      expect((await repository.findSession('session-a'))?.currentIndex).toBe(1);
    });
  });
}

function profile(id: string, name: string, updatedAt: string): ChildProfile {
  return {
    id,
    displayName: name,
    persianName: name,
    uiLocale: 'fa',
    createdAt: '2026-07-31T18:00:00.000Z',
    updatedAt
  };
}

function activeSession(id: string, updatedAt: string): WritingSession {
  const session = startPractice(createWritingSession({
    id,
    profileId: 'profile-a',
    logicalName: 'امیر',
    now: '2026-07-31T18:00:00.000Z'
  }), updatedAt);
  return { ...session, updatedAt };
}
