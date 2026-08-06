"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BudgetView, FeedPostView, Page, SendKudoCommand } from "../types";
import { useApi } from "@/providers/app-providers";

export function useSendKudo() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: SendKudoCommand) => api.sendKudo(command, crypto.randomUUID()),
    onSuccess: (post) => {
      queryClient.setQueryData<Page<FeedPostView>>(["feed"], (old) => ({
        items: [post, ...(old?.items.filter((item) => item.id !== post.id) ?? [])],
      }));
      queryClient.setQueryData<BudgetView>(["budget"], (old) => old
        ? { ...old, spent: old.spent + post.points, remaining: old.remaining - post.points }
        : old);
    },
  });
}
