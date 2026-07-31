import { createWritingSession, InMemorySessionRepository } from '../src';

describe('session repository contract', () => {
  it('returns the most recently updated active session', async () => {
    const repository = new InMemorySessionRepository();
    await repository.saveSession(createWritingSession({
      id: 'older', profileId: 'profile', logicalName: 'لیا', now: '2026-07-31T08:00:00.000Z'
    }));
    await repository.saveSession(createWritingSession({
      id: 'newer', profileId: 'profile', logicalName: 'امیر', now: '2026-07-31T09:00:00.000Z'
    }));

    await expect(repository.findActiveSession()).resolves.toMatchObject({ id: 'newer' });
  });
});
