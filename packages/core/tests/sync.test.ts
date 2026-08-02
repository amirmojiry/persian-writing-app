import { describe, expect, it } from 'vitest';
import {
  InMemorySyncOutboxRepository,
  SyncCoordinator,
  createOutboxEntry,
  type ConsentSnapshot,
  type SyncTransport
} from '../src';

const allowed: ConsentSnapshot = {
  accountSync: true,
  learningAnalytics: false,
  capturedAt: '2026-08-02T10:00:00.000Z'
};

function entry(consent = allowed) {
  return createOutboxEntry({
    id: crypto.randomUUID(),
    aggregateType: 'session',
    aggregateId: crypto.randomUUID(),
    operation: 'upsert',
    payload: { status: 'completed' },
    idempotencyKey: crypto.randomUUID(),
    consentSnapshot: consent,
    now: '2026-08-02T10:00:00.000Z'
  });
}

describe('sync consent and outbox', () => {
  it('blocks entries created without account-sync consent', () => {
    const created = entry({ ...allowed, accountSync: false });
    expect(created.state).toBe('blocked_privacy');
  });

  it('does not dispatch while offline', async () => {
    const repository = new InMemorySyncOutboxRepository();
    await repository.save(entry());
    let calls = 0;
    const transport: SyncTransport = {
      async send() {
        calls += 1;
        return [];
      }
    };
    const sent = await new SyncCoordinator(repository, transport).flush({
      online: false,
      consent: allowed,
      now: '2026-08-02T10:01:00.000Z'
    });
    expect(sent).toBe(0);
    expect(calls).toBe(0);
  });

  it('marks accepted and duplicate outcomes as sent', async () => {
    const repository = new InMemorySyncOutboxRepository();
    const first = entry();
    const second = entry();
    await repository.save(first);
    await repository.save(second);
    const transport: SyncTransport = {
      async send(entries) {
        return entries.map((candidate, index) => ({
          idempotencyKey: candidate.idempotencyKey,
          status: index === 0 ? 'accepted' : 'duplicate'
        }));
      }
    };
    const sent = await new SyncCoordinator(repository, transport).flush({
      online: true,
      consent: allowed,
      now: '2026-08-02T10:01:00.000Z'
    });
    expect(sent).toBe(2);
    expect(repository.snapshot().every((candidate) => candidate.state === 'sent')).toBe(true);
  });

  it('immediately blocks queued work when privacy mode is enabled', async () => {
    const repository = new InMemorySyncOutboxRepository();
    await repository.save(entry());
    const coordinator = new SyncCoordinator(repository, { async send() { return []; } });
    await coordinator.flush({
      online: true,
      consent: { ...allowed, accountSync: false },
      now: '2026-08-02T10:02:00.000Z'
    });
    expect(repository.snapshot()[0]?.state).toBe('blocked_privacy');
  });
});
