import type {
  ChildProfile,
  SessionRepository,
  WritingSession
} from '@persian-writing/core';

export const DESKTOP_SQLITE_MIGRATION_KEY = 'persian-writing:desktop-sqlite-migration:v1';
const MIGRATION_COMPLETE = 'complete';

export interface LegacyDesktopSessionSource {
  listProfiles(): Promise<readonly ChildProfile[]>;
  listSessions(): Promise<readonly WritingSession[]>;
}

export interface MigrationMarker {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export async function migrateLegacyDesktopStorage(
  source: LegacyDesktopSessionSource,
  target: SessionRepository,
  marker?: MigrationMarker
): Promise<void> {
  if (migrationIsComplete(marker)) {
    return;
  }

  const [profiles, sessions] = await Promise.all([
    source.listProfiles(),
    source.listSessions()
  ]);

  for (const profile of profiles) {
    await target.saveProfile(profile);
  }
  for (const session of sessions) {
    await target.saveSession(session);
  }

  markMigrationComplete(marker);
}

function migrationIsComplete(marker?: MigrationMarker): boolean {
  try {
    return marker?.getItem(DESKTOP_SQLITE_MIGRATION_KEY) === MIGRATION_COMPLETE;
  } catch {
    return false;
  }
}

function markMigrationComplete(marker?: MigrationMarker): void {
  try {
    marker?.setItem(DESKTOP_SQLITE_MIGRATION_KEY, MIGRATION_COMPLETE);
  } catch {
    // A missing or restricted Web Storage implementation must not block local data migration.
  }
}
