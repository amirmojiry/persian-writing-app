import { invoke } from '@tauri-apps/api/core';
import type {
  ChildProfile,
  SessionRepository,
  WritingSession
} from '@persian-writing/core';

export class TauriSqliteSessionRepository implements SessionRepository {
  async saveProfile(profile: ChildProfile): Promise<void> {
    await invoke('save_profile', { profile });
  }

  async listProfiles(): Promise<readonly ChildProfile[]> {
    return await invoke<ChildProfile[]>('list_profiles');
  }

  async saveSession(session: WritingSession): Promise<void> {
    await invoke('save_session', { session });
  }

  async findSession(id: string): Promise<WritingSession | null> {
    return await invoke<WritingSession | null>('find_session', { id });
  }

  async findActiveSession(): Promise<WritingSession | null> {
    return await invoke<WritingSession | null>('find_active_session');
  }
}
