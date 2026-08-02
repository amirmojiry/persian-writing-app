import type {
  AdminExportResponse,
  AdminSessionDetailResponse,
  AdminSessionListResponse,
  ForwardingConfiguration,
  ForwardingOverviewResponse
} from '@persian-writing/contracts';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export class AdminApiClient {
  constructor(private readonly baseUrl = API_BASE) {}

  async listSessions(token: string, query = ''): Promise<AdminSessionListResponse> {
    return await this.request(`/admin/sessions${query}`, token);
  }

  async getSession(token: string, id: string): Promise<AdminSessionDetailResponse> {
    return await this.request(`/admin/sessions/${encodeURIComponent(id)}`, token);
  }

  async createExport(token: string, format: 'csv' | 'json', filters: Readonly<Record<string, unknown>>): Promise<AdminExportResponse> {
    return await this.request('/admin/exports', token, {
      method: 'POST', body: JSON.stringify({ format, filters })
    });
  }

  async getExport(token: string, id: string): Promise<AdminExportResponse> {
    return await this.request(`/admin/exports/${encodeURIComponent(id)}`, token);
  }

  async forwarding(token: string): Promise<ForwardingOverviewResponse> {
    return await this.request('/admin/forwarding', token);
  }

  async saveForwarding(token: string, config: ForwardingConfiguration): Promise<{ readonly config: ForwardingConfiguration }> {
    return await this.request('/admin/forwarding', token, {
      method: 'PUT', body: JSON.stringify(config)
    });
  }

  private async request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json', 'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, ...init.headers
      }
    });
    if (!response.ok) throw new Error(`Administration API failed with HTTP ${response.status}.`);
    return await response.json() as T;
  }
}
