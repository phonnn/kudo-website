"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/app-providers";

export function useProfile() {
  const api = useApi();
  const user = useQuery({ queryKey: ["me"], queryFn: () => api.getMe() });
  const points = useQuery({ queryKey: ["points", "me"], queryFn: () => api.getPointBalance() });
  const redemptions = useQuery({
    queryKey: ["redemptions", "me"],
    queryFn: () => api.getRedemptionHistory(),
  });
  return { user, points, redemptions };
}
