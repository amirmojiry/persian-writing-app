export interface ConsentSnapshot {
  readonly accountSync: boolean;
  readonly learningAnalytics: boolean;
  readonly capturedAt: string;
}

export type SyncOperation = 'upsert' | 'delete';
export type SyncAggregateType = 'profile' | 'session' | 'event';
export type SyncOutboxState = 'pending' | 'sending' | 'sent' | 'failed' | 'blocked_privacy';

export interface SyncOutboxEntry {
  readonly id: string;
  readonly aggregateType: SyncAggregateType;
  readonly aggregateId: string;
  readonly operation: SyncOperation;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
  readonly consentSnapshot: ConsentSnapshot;
  readonly state: SyncOutboxState;
  readonly attempts: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastError?: string | undefined;
}

export interface SyncOutboxRepository {
  save(entry: SyncOutboxEntry): Promise<void>;
  listDispatchable(limit: number): Promise<readonly SyncOutboxEntry[]>;
  mark(entries: readonly SyncOutboxEntry[]): Promise<void>;
  blockAllForPrivacy(now: string): Promise<void>;
}

export interface SyncBatchOutcome {
  readonly idempotencyKey: string;
  readonly status: 'accepted' | 'duplicate' | 'blocked_privacy' | 'failed';
}

export interface SyncTransport {
  send(entries: readonly SyncOutboxEntry[]): Promise<readonly SyncBatchOutcome[]>;
}

export function createOutboxEntry(input: {
  readonly id: string;
  readonly aggregateType: SyncAggregateType;
  readonly aggregateId: string;
  readonly operation: SyncOperation;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly idempotencyKey: string;
  readonly consentSnapshot: ConsentSnapshot;
  readonly now: string;
}): SyncOutboxEntry {
  return {...input, state: input.consentSnapshot.accountSync ? 'pending' : 'blocked_privacy', attempts: 0, createdAt: input.now, updatedAt: input.now};
}

export class SyncCoordinator {
  constructor(private readonly repository: SyncOutboxRepository, private readonly transport: SyncTransport) {}

  async flush(input: { readonly online: boolean; readonly consent: ConsentSnapshot; readonly now: string }): Promise<number> {
    if (!input.consent.accountSync) { await this.repository.blockAllForPrivacy(input.now); return 0; }
    if (!input.online) return 0;
    const entries = await this.repository.listDispatchable(100);
    if (entries.length === 0) return 0;
    const sending = entries.map((entry) => ({...entry, state: 'sending' as const, attempts: entry.attempts + 1, updatedAt: input.now}));
    await this.repository.mark(sending);
    try {
      const outcomes = await this.transport.send(sending);
      const byKey = new Map(outcomes.map((outcome) => [outcome.idempotencyKey, outcome]));
      await this.repository.mark(sending.map((entry) => {
        const status = byKey.get(entry.idempotencyKey)?.status ?? 'failed';
        return {...entry, state: status === 'accepted' || status === 'duplicate' ? 'sent' : status, updatedAt: input.now, lastError: status === 'failed' ? 'Sync endpoint rejected the item.' : undefined};
      }));
      return outcomes.filter((outcome) => outcome.status === 'accepted' || outcome.status === 'duplicate').length;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sync failed.';
      await this.repository.mark(sending.map((entry) => ({...entry, state: 'failed' as const, updatedAt: input.now, lastError: message})));
      return 0;
    }
  }
}

export class InMemorySyncOutboxRepository implements SyncOutboxRepository {
  private readonly entries = new Map<string, SyncOutboxEntry>();
  async save(entry: SyncOutboxEntry): Promise<void> { this.entries.set(entry.id, structuredClone(entry)); }
  async listDispatchable(limit: number): Promise<readonly SyncOutboxEntry[]> {
    return Array.from(this.entries.values()).filter((entry) => (entry.state === 'pending' || entry.state === 'failed') && entry.consentSnapshot.accountSync).sort((left, right) => left.createdAt.localeCompare(right.createdAt)).slice(0, limit).map((entry) => structuredClone(entry));
  }
  async mark(entries: readonly SyncOutboxEntry[]): Promise<void> { for (const entry of entries) this.entries.set(entry.id, structuredClone(entry)); }
  async blockAllForPrivacy(now: string): Promise<void> { for (const entry of this.entries.values()) if (entry.state !== 'sent') this.entries.set(entry.id, {...entry, state: 'blocked_privacy', updatedAt: now}); }
  snapshot(): readonly SyncOutboxEntry[] { return Array.from(this.entries.values()).map((entry) => structuredClone(entry)); }
}
