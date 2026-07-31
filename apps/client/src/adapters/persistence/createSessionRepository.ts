import { InMemorySessionRepository, type SessionRepository } from '@persian-writing/core';
import { IndexedDbSessionRepository } from './IndexedDbSessionRepository';

export function createSessionRepository(): SessionRepository {
  return typeof globalThis.indexedDB === 'undefined'
    ? new InMemorySessionRepository()
    : new IndexedDbSessionRepository();
}
