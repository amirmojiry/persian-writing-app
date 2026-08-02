export const sessionSchemaVersion = 1 as const;
export const applicationVersion = '0.8.0' as const;

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
  readonly isAdmin?: boolean;
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

export interface AdminSessionRecord {
  readonly id: string;
  readonly aggregate_id: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly consent_snapshot: ConsentSnapshotContract;
  readonly created_at: string;
}

export interface AdminSessionListResponse {
  readonly data: readonly AdminSessionRecord[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export interface AdminSessionDetailResponse {
  readonly session: AdminSessionRecord;
}

export interface AdminExportRecord {
  readonly id: string;
  readonly format: 'csv' | 'json';
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
  readonly storage_path?: string | null;
  readonly record_count: number;
  readonly last_error?: string | null;
}

export interface AdminExportResponse {
  readonly export: AdminExportRecord;
}

export interface ForwardingConfiguration {
  readonly id?: string;
  readonly name: string;
  readonly endpointUrl: string;
  readonly secret?: string | null;
  readonly enabled: boolean;
  readonly aggregateTypes: readonly ('profile' | 'session' | 'event')[];
  readonly maxAttempts: number;
  readonly backoffSeconds: number;
}

export interface ForwardingOverviewResponse {
  readonly configs: readonly Readonly<Record<string, unknown>>[];
  readonly failures: readonly Readonly<Record<string, unknown>>[];
}
