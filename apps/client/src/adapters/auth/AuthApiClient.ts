export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
}

export interface AuthSession {
  readonly token: string;
  readonly user: AuthenticatedUser;
}

export class AuthApiClient {
  constructor(private readonly baseUrl = import.meta.env.VITE_API_URL ?? '') {}

  async requestOtp(email: string, deviceId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, deviceId })
    });
    if (!response.ok && response.status !== 429) {
      throw new Error('Unable to request a verification code.');
    }
  }

  async verifyOtp(input: {
    readonly email: string;
    readonly code: string;
    readonly deviceId: string;
    readonly deviceName?: string;
  }): Promise<AuthSession> {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input)
    });
    if (!response.ok) throw new Error('The verification code is invalid or expired.');
    return await response.json() as AuthSession;
  }

  async logout(token: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    });
  }
}

export class MemoryTokenStore {
  private token: string | null = null;
  get(): string | null { return this.token; }
  set(token: string): void { this.token = token; }
  clear(): void { this.token = null; }
}
