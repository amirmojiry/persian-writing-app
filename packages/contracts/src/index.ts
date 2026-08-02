export const sessionSchemaVersion = 1 as const;
export const applicationVersion = '0.7.0' as const;

export interface OtpRequestBody {
  readonly email: string;
  readonly deviceId: string;
}

export interface OtpVerifyBody extends OtpRequestBody {
  readonly code: string;
  readonly deviceName?: string;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
}

export interface AuthSessionResponse {
  readonly token: string;
  readonly user: AuthUser;
}

export interface ConsentSnapshotContract {
  readonly accountSync: boolean;
  readonly learningAnalytics?: boolean;
  readonly capturedAt?: string;
}

export interface SyncBatchItem {
  readonly idempotencyKey: string;
  readonly aggregateType: 'profile' | 'session' | 'event';
  readonly aggregateId: string;
  readonly operation: 'upsert' | 'delete';
  readonly payload: Readonly<Record<string, unknown>>;
  readonly consentSnapshot: ConsentSnapshotContract;
}

export interface SyncBatchResponseItem {
  readonly idempotencyKey: string;
  readonly status: 'accepted' | 'duplicate' | 'blocked_privacy' | 'failed';
}
