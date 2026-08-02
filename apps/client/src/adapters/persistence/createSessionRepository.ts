import {
  InMemorySessionRepository,
  type ChildProfile,
  type SessionRepository,
  type WritingSession
} from '@persian-writing/core';
import { isTauriRuntime } from '@/runtime/isTauriRuntime';
import { IndexedDbSessionRepository } from './IndexedDbSessionRepository';
import { migrateLegacyDesktopStorage } from './migrateLegacyDesktopStorage';

export function createSessionRepository(): SessionRepository {
  return new LazyRuntimeSessionRepository();
}

class LazyRuntimeSessionRepository implements SessionRepository {
  private readonly delegate = resolveSessionRepository();

  async saveProfile(profile: ChildProfile): Promise<void> {
    await (await this.delegate).saveProfile(profile);
  }

  async listProfiles(): Promise<readonly ChildProfile[]> {
    return await (await this.delegate).listProfiles();
  }

  async saveSession(session: WritingSession): Promise<void> {
    await (await this.delegate).saveSession(session);
  }

  async findSession(id: string): Promise<WritingSession | null> {
    return await (await this.delegate).findSession(id);
  }

  async findActiveSession(): Promise<WritingSession | null> {
    return await (await this.delegate).findActiveSession();
  }
}

async function resolveSessionRepository(): Promise<SessionRepository> {
  if (isTauriRuntime()) {
    const { TauriSqliteSessionRepository } = await import('./TauriSqliteSessionRepository');
    const repository = new TauriSqliteSessionRepository();

    if (typeof globalThis.indexedDB !== 'undefined') {
      const legacyRepository = new IndexedDbSessionRepository();
      await migrateLegacyDesktopStorage(
        legacyRepository,
        repository,
        safeLocalStorage()
      );
    }

    return repository;
  }

  return typeof globalThis.indexedDB === 'undefined'
    ? new InMemorySessionRepository()
    : new IndexedDbSessionRepository();
}

function safeLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
