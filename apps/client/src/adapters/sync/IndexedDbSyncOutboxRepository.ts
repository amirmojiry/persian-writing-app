import type { SyncOutboxEntry, SyncOutboxRepository } from '@persian-writing/core';
import {
  SYNC_OUTBOX_STORE,
  openClientDatabase,
  requestResult,
  transactionDone
} from '@/adapters/persistence/IndexedDbSessionRepository';

export class IndexedDbSyncOutboxRepository implements SyncOutboxRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly databaseName?: string) {}

  async save(entry: SyncOutboxEntry): Promise<void> {
    const database = await this.database();
    await transactionDone(database, SYNC_OUTBOX_STORE, 'readwrite', (store) => store.put(entry));
  }

  async listDispatchable(limit: number): Promise<readonly SyncOutboxEntry[]> {
    const database = await this.database();
    const entries = await requestResult<SyncOutboxEntry[]>(
      database.transaction(SYNC_OUTBOX_STORE, 'readonly').objectStore(SYNC_OUTBOX_STORE).getAll()
    );
    return entries
      .filter((entry) => (entry.state === 'pending' || entry.state === 'failed') && entry.consentSnapshot.accountSync)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, limit);
  }

  async mark(entries: readonly SyncOutboxEntry[]): Promise<void> {
    if (entries.length === 0) return;
    const database = await this.database();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(SYNC_OUTBOX_STORE, 'readwrite');
      const store = transaction.objectStore(SYNC_OUTBOX_STORE);
      for (const entry of entries) store.put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Unable to update sync outbox.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Sync outbox update aborted.'));
    });
  }

  async blockAllForPrivacy(now: string): Promise<void> {
    const database = await this.database();
    const entries = await requestResult<SyncOutboxEntry[]>(
      database.transaction(SYNC_OUTBOX_STORE, 'readonly').objectStore(SYNC_OUTBOX_STORE).getAll()
    );
    await this.mark(entries.filter((entry) => entry.state !== 'sent').map((entry) => ({
      ...entry,
      state: 'blocked_privacy' as const,
      updatedAt: now
    })));
  }

  private database(): Promise<IDBDatabase> {
    this.databasePromise ??= openClientDatabase(this.databaseName);
    return this.databasePromise;
  }
}
