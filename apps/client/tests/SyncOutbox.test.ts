import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { createOutboxEntry } from '@persian-writing/core';
import { IndexedDbSyncOutboxRepository } from '@/adapters/sync/IndexedDbSyncOutboxRepository';

const databases: string[] = [];

afterEach(async () => {
  await Promise.all(databases.splice(0).map((name) => new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  })));
});

describe('IndexedDbSyncOutboxRepository', () => {
  it('persists eligible entries and blocks them immediately for privacy', async () => {
    const name = `sync-${crypto.randomUUID()}`;
    databases.push(name);
    const repository = new IndexedDbSyncOutboxRepository(name);
    await repository.save(createOutboxEntry({
      id: crypto.randomUUID(),
      aggregateType: 'session',
      aggregateId: crypto.randomUUID(),
      operation: 'upsert',
      payload: { status: 'completed' },
      idempotencyKey: crypto.randomUUID(),
      consentSnapshot: { accountSync: true, learningAnalytics: false, capturedAt: '2026-08-02T10:00:00.000Z' },
      now: '2026-08-02T10:00:00.000Z'
    }));

    expect(await repository.listDispatchable(10)).toHaveLength(1);
    await repository.blockAllForPrivacy('2026-08-02T10:01:00.000Z');
    expect(await repository.listDispatchable(10)).toHaveLength(0);
  });
});
