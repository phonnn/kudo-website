import type { ApiClient } from "@/lib/api/client.interface";
import type { SendKudoCommand } from "@/features/kudo/types";

export class HttpApiClient implements ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
    if (!response.ok) throw new Error(`API request failed (${response.status})`);
    return response.json() as Promise<T>;
  }

  getMe = () => this.request<Awaited<ReturnType<ApiClient["getMe"]>>>("/me");
  getUsers = () => this.request<Awaited<ReturnType<ApiClient["getUsers"]>>>("/users");
  getBudget = () => this.request<Awaited<ReturnType<ApiClient["getBudget"]>>>("/budget");
  getPointBalance = () =>
    this.request<Awaited<ReturnType<ApiClient["getPointBalance"]>>>("/me/points");
  getRedemptionHistory = () =>
    this.request<Awaited<ReturnType<ApiClient["getRedemptionHistory"]>>>("/me/redemptions");
  getFeed = (cursor?: string) =>
    this.request<Awaited<ReturnType<ApiClient["getFeed"]>>>(
      `/feed${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`,
    );
  sendKudo = (command: SendKudoCommand, idempotencyKey: string) =>
    this.request<Awaited<ReturnType<ApiClient["sendKudo"]>>>("/kudos", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify(command),
    });
}
