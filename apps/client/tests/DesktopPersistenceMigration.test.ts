import { describe, expect, it, vi } from 'vitest';
import {
  createWritingSession,
  startPractice,
  type ChildProfile,
  type SessionRepository,
  type WritingSession
} from '@persian-writing/core';
import {
  DESKTOP_SQLITE_MIGRATION_KEY,
  migrateLegacyDesktopStorage
} from '../src/adapters/persistence/migrateLegacyDesktopStorage';

describe('desktop persistence migration', () => {
  it('copies every legacy profile and session before marking migration complete', async () => {
    const profile = fixtureProfile();
    const session = fixtureSession();
    const source = {
      listProfiles: vi.fn().mockResolvedValue([profile]),
      listSessions: vi.fn().mockResolvedValue([session])
    };
    const target = repositorySpy();
    const marker = markerSpy();

    await migrateLegacyDesktopStorage(source, target, marker);

    expect(target.saveProfile).toHaveBeenCalledWith(profile);
    expect(target.saveSession).toHaveBeenCalledWith(session);
    expect(marker.setItem).toHaveBeenCalledWith(
      DESKTOP_SQLITE_MIGRATION_KEY,
      'complete'
    );
  });

  it('does not repeat a completed migration', async () => {
    const source = {
      listProfiles: vi.fn(),
      listSessions: vi.fn()
    };
    const target = repositorySpy();
    const marker = markerSpy('complete');

    await migrateLegacyDesktopStorage(source, target, marker);

    expect(source.listProfiles).not.toHaveBeenCalled();
    expect(source.listSessions).not.toHaveBeenCalled();
    expect(target.saveProfile).not.toHaveBeenCalled();
  });

  it('does not mark migration complete when a target write fails', async () => {
    const source = {
      listProfiles: vi.fn().mockResolvedValue([fixtureProfile()]),
      listSessions: vi.fn().mockResolvedValue([])
    };
    const target = repositorySpy();
    vi.mocked(target.saveProfile).mockRejectedValue(new Error('write failed'));
    const marker = markerSpy();

    await expect(migrateLegacyDesktopStorage(source, target, marker)).rejects.toThrow('write failed');
    expect(marker.setItem).not.toHaveBeenCalled();
  });
});

function repositorySpy(): SessionRepository {
  return {
    saveProfile: vi.fn().mockResolvedValue(undefined),
    listProfiles: vi.fn().mockResolvedValue([]),
    saveSession: vi.fn().mockResolvedValue(undefined),
    findSession: vi.fn().mockResolvedValue(null),
    findActiveSession: vi.fn().mockResolvedValue(null)
  };
}

function markerSpy(value: string | null = null) {
  return {
    getItem: vi.fn().mockReturnValue(value),
    setItem: vi.fn()
  };
}

function fixtureProfile(): ChildProfile {
  return {
    id: 'profile-a',
    displayName: 'لیا',
    persianName: 'لیا',
    uiLocale: 'fa',
    createdAt: '2026-07-31T18:00:00.000Z',
    updatedAt: '2026-07-31T18:00:00.000Z'
  };
}

function fixtureSession(): WritingSession {
  return startPractice(createWritingSession({
    id: 'session-a',
    profileId: 'profile-a',
    logicalName: 'لیا',
    now: '2026-07-31T18:00:00.000Z'
  }), '2026-07-31T18:00:00.000Z');
}
