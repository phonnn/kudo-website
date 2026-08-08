"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FeedPostView } from "@/features/feed/types";
import type { Page } from "@/lib/api/shared-types";
import type { BudgetView, SendKudoCommand } from "../types";
import { useApi } from "@/providers/app-providers";

export interface SendKudoVariables {
  command: SendKudoCommand;
  idempotencyKey: string;
}

export function useSendKudo() {
  const api = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ command, idempotencyKey }: SendKudoVariables) =>
      api.sendKudo(command, idempotencyKey),
    onSuccess: (post) => {
      queryClient.setQueryData<Page<FeedPostView>>(["feed"], (old) => ({
        items: [post, ...(old?.items.filter((item) => item.id !== post.id) ?? [])],
      }));
      queryClient.setQueryData<BudgetView>(["budget"], (old) => updateBudget(old, post.points));
    },
  });
}

function updateBudget(old: BudgetView | undefined, points: number) {
  if (!old) {
    return old;
  }

  return {
    ...old,
    spent: old.spent + points,
    remaining: old.remaining - points,
  };
}
