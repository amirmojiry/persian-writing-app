import type { SessionRepository } from './ports';
import type { ChildProfile, WritingSession } from './types';

export class InMemorySessionRepository implements SessionRepository {
  private readonly profiles = new Map<string, ChildProfile>();
  private readonly sessions = new Map<string, WritingSession>();

  async saveProfile(profile: ChildProfile): Promise<void> {
    this.profiles.set(profile.id, structuredClone(profile));
  }

  async listProfiles(): Promise<readonly ChildProfile[]> {
    return Array.from(this.profiles.values())
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((profile) => structuredClone(profile));
  }

  async saveSession(session: WritingSession): Promise<void> {
    this.sessions.set(session.id, structuredClone(session));
  }

  async findSession(id: string): Promise<WritingSession | null> {
    const session = this.sessions.get(id);
    return session === undefined ? null : structuredClone(session);
  }

  async findActiveSession(): Promise<WritingSession | null> {
    const session = Array.from(this.sessions.values())
      .filter((candidate) => candidate.status === 'active')
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
    return session === undefined ? null : structuredClone(session);
  }
}
