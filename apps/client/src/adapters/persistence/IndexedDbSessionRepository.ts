import type {
  ChildProfile,
  SessionRepository,
  WritingSession
} from '@persian-writing/core';

const DATABASE_NAME = 'persian-writing-app';
const DATABASE_VERSION = 1;
const PROFILE_STORE = 'profiles';
const SESSION_STORE = 'sessions';

export class IndexedDbSessionRepository implements SessionRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  constructor(private readonly databaseName = DATABASE_NAME) {}

  async saveProfile(profile: ChildProfile): Promise<void> {
    const database = await this.database();
    await transactionDone(database, PROFILE_STORE, 'readwrite', (store) => store.put(profile));
  }

  async listProfiles(): Promise<readonly ChildProfile[]> {
    const database = await this.database();
    const profiles = await requestResult<ChildProfile[]>(
      database.transaction(PROFILE_STORE, 'readonly').objectStore(PROFILE_STORE).getAll()
    );
    return profiles.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async saveSession(session: WritingSession): Promise<void> {
    const database = await this.database();
    await transactionDone(database, SESSION_STORE, 'readwrite', (store) => store.put(session));
  }

  async listSessions(): Promise<readonly WritingSession[]> {
    const database = await this.database();
    const sessions = await requestResult<WritingSession[]>(
      database.transaction(SESSION_STORE, 'readonly').objectStore(SESSION_STORE).getAll()
    );
    return sessions.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async findSession(id: string): Promise<WritingSession | null> {
    const database = await this.database();
    const result = await requestResult<WritingSession | undefined>(
      database.transaction(SESSION_STORE, 'readonly').objectStore(SESSION_STORE).get(id)
    );
    return result ?? null;
  }

  async findActiveSession(): Promise<WritingSession | null> {
    const sessions = await this.listSessions();
    return sessions.find((session) => session.status === 'active') ?? null;
  }

  private database(): Promise<IDBDatabase> {
    this.databasePromise ??= openDatabase(this.databaseName);
    return this.databasePromise;
  }
}

function openDatabase(databaseName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILE_STORE)) {
        database.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(SESSION_STORE)) {
        const store = database.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB.'));
    request.onblocked = () => reject(new Error('IndexedDB upgrade was blocked.'));
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'));
  });
}

function transactionDone(
  database: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    operation(transaction.objectStore(storeName));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'));
  });
}
