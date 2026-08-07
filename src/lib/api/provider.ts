import type { ApiClient } from "./client.interface";
import { createHttpApiClient } from "./http/http-client";
import { MockApiClient } from "./mock/mock-client";

let client: ApiClient | undefined;

export function createApiClient(): ApiClient {
  if (client) {
    return client;
  }

  if (process.env.NEXT_PUBLIC_API_MODE === "http") {
    client = createHttpApiClient(process.env.NEXT_PUBLIC_API_URL ?? "");
  } else {
    client = new MockApiClient();
  }

  return client;
}
