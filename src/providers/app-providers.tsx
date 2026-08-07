"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import type { ApiClient } from "@/lib/api/client.interface";
import { createApiClient } from "@/lib/api/provider";
import { ApiError } from "@/lib/errors/api-error";

const ApiContext = createContext<ApiClient | null>(null);

export function useApi() {
  const api = useContext(ApiContext);
  if (!api) throw new Error("useApi must be used inside AppProviders");
  return api;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [api] = useState(createApiClient);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
          mutations: {
            retry: (count, error) => error instanceof ApiError && error.retryable && count < 2,
          },
        },
      }),
  );

  return (
    <ApiContext.Provider value={api}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}
