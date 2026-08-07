import { ApiError } from "@/lib/errors/api-error";

export class HttpTransport {
  private accessToken = "";

  constructor(private readonly baseUrl: string) {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("goodjob.accessToken") ?? "";
    }
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  clearAccessToken() {
    this.accessToken = "";
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers);
    headers.set("content-type", "application/json");

    if (this.accessToken) {
      headers.set("authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      await this.throwResponseError(response, path);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async eventSource(path: string, handlers: Record<string, (data: unknown) => void>) {
    const { ticket } = await this.request<{ ticket: string }>("/auth/stream-ticket", {
      method: "POST",
    });
    const url = `${this.baseUrl}${path}?ticket=${encodeURIComponent(ticket)}`;
    const source = new EventSource(url);

    Object.entries(handlers).forEach(([type, handler]) => {
      source.addEventListener(type, (event) => {
        handler(JSON.parse((event as MessageEvent).data));
      });
    });

    return () => source.close();
  }

  private async throwResponseError(response: Response, path: string): Promise<never> {
    const body = (await response.json().catch(() => ({}))) as {
      code?: string;
      message?: string;
      requestId?: string;
    };
    const isAuthRequest = path.startsWith("/auth/login") || path.startsWith("/auth/register");

    if (response.status === 401 && !isAuthRequest) {
      this.clearSession();
    }

    throw new ApiError(
      (body.code as "INTERNAL") ?? "INTERNAL",
      body.message ?? `API request failed (${response.status})`,
      response.status >= 500,
      body.requestId,
    );
  }

  private clearSession() {
    this.clearAccessToken();

    if (typeof window !== "undefined") {
      localStorage.removeItem("goodjob.accessToken");
      localStorage.removeItem("goodjob.refreshToken");
      localStorage.removeItem("goodjob.user");
      window.location.assign("/login");
    }
  }
}
