import type { SyncBatchOutcome, SyncOutboxEntry, SyncTransport } from '@persian-writing/core';

export class HttpSyncTransport implements SyncTransport {
  constructor(
    private readonly token: () => string | null,
    private readonly baseUrl = import.meta.env.VITE_API_URL ?? ''
  ) {}

  async send(entries: readonly SyncOutboxEntry[]): Promise<readonly SyncBatchOutcome[]> {
    const token = this.token();
    if (token === null) throw new Error('Sign in before synchronizing.');

    const response = await fetch(`${this.baseUrl}/api/v1/sync/batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        items: entries.map((entry) => ({
          idempotencyKey: entry.idempotencyKey,
          aggregateType: entry.aggregateType,
          aggregateId: entry.aggregateId,
          operation: entry.operation,
          payload: entry.payload,
          consentSnapshot: entry.consentSnapshot
        }))
      })
    });
    if (!response.ok) throw new Error(`Sync failed with status ${response.status}.`);
    const payload = await response.json() as { readonly items: readonly SyncBatchOutcome[] };
    return payload.items;
  }
}
