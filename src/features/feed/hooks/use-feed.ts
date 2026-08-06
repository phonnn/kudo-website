"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/app-providers";

export function useFeed() {
  const api = useApi();
  return useQuery({ queryKey: ["feed"], queryFn: () => api.getFeed() });
}
