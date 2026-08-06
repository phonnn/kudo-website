import type { ApiClient } from "./client.interface";
import { HttpApiClient } from "./http/http-client";
import { MockApiClient } from "./mock/mock-client";

let client: ApiClient | undefined;

export function createApiClient(): ApiClient {
  if (client) return client;
  client = process.env.NEXT_PUBLIC_API_MODE === "http"
    ? new HttpApiClient(process.env.NEXT_PUBLIC_API_URL ?? "")
    : new MockApiClient();
  return client;
}
