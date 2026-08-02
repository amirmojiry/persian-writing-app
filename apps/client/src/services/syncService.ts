import {
  SyncCoordinator,
  createOutboxEntry,
  type ChildProfile,
  type ConsentSnapshot,
  type WritingSession
} from '@persian-writing/core';
import { MemoryTokenStore } from '@/adapters/auth/AuthApiClient';
import { HttpSyncTransport } from '@/adapters/sync/HttpSyncTransport';
import { IndexedDbSyncOutboxRepository } from '@/adapters/sync/IndexedDbSyncOutboxRepository';

const CONSENT_KEY = 'persian-writing-sync-consent-v1';
const DEVICE_KEY = 'persian-writing-device-id-v1';
const repository = new IndexedDbSyncOutboxRepository();
export const tokenStore = new MemoryTokenStore();
const coordinator = new SyncCoordinator(repository, new HttpSyncTransport(() => tokenStore.get()));

export function readConsent(): ConsentSnapshot {
  const fallback: ConsentSnapshot = {
    accountSync: false,
    learningAnalytics: false,
    capturedAt: new Date(0).toISOString()
  };
  if (typeof localStorage === 'undefined') return fallback;
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === null) return fallback;
  try {
    const parsed = JSON.parse(stored) as Partial<ConsentSnapshot>;
    return {
      accountSync: parsed.accountSync === true,
      learningAnalytics: parsed.learningAnalytics === true,
      capturedAt: typeof parsed.capturedAt === 'string' ? parsed.capturedAt : fallback.capturedAt
    };
  } catch {
    return fallback;
  }
}

export async function setAccountSyncConsent(enabled: boolean): Promise<ConsentSnapshot> {
  const consent: ConsentSnapshot = {
    ...readConsent(),
    accountSync: enabled,
    capturedAt: new Date().toISOString()
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  if (!enabled) {
    await coordinator.flush({ online: true, consent, now: consent.capturedAt });
  }
  return consent;
}

export function deviceId(): string {
  if (typeof localStorage === 'undefined') return 'ephemeral-device';
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing !== null) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, created);
  return created;
}

export async function queueProfile(profile: ChildProfile): Promise<void> {
  await queue('profile', profile.id, profile as unknown as Record<string, unknown>, profile.updatedAt);
}

export async function queueSession(session: WritingSession): Promise<void> {
  await queue('session', session.id, session as unknown as Record<string, unknown>, session.updatedAt);
}

async function queue(
  aggregateType: 'profile' | 'session',
  aggregateId: string,
  payload: Readonly<Record<string, unknown>>,
  now: string
): Promise<void> {
  const consent = readConsent();
  await repository.save(createOutboxEntry({
    id: crypto.randomUUID(),
    aggregateType,
    aggregateId,
    operation: 'upsert',
    payload,
    idempotencyKey: crypto.randomUUID(),
    consentSnapshot: consent,
    now
  }));
}

export async function flushSync(): Promise<number> {
  const consent = readConsent();
  return await coordinator.flush({
    online: typeof navigator === 'undefined' ? false : navigator.onLine,
    consent,
    now: new Date().toISOString()
  });
}
