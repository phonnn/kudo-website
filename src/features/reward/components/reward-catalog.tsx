"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/providers/app-providers";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast-provider";
import { RewardImage } from "./reward-image";

export function RewardCatalog() {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const rewards = useQuery({ queryKey: ["rewards"], queryFn: () => api.getRewards() });
  const balance = useQuery({ queryKey: ["points", "me"], queryFn: () => api.getPointBalance() });
  const [redeeming, setRedeeming] = useState<string | null>(null);
  async function redeem(id: string) {
    setRedeeming(id);

    try {
      const result = await api.redeemReward(id, crypto.randomUUID());
      showToast(`${result.rewardName} has been redeemed.`, "success");
      await queryClient.invalidateQueries({ queryKey: ["points", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["redemptions", "me"] });
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message);
      } else {
        showToast("Could not redeem reward.");
      }
    } finally {
      setRedeeming(null);
    }
  }

  if (rewards.isPending) {
    return <EmptyState>Loading rewards…</EmptyState>;
  }

  return (
    <>
      <div className="reward-grid">
        {rewards.data?.map((reward) => {
          const affordable = (balance.data?.earned ?? 0) >= reward.costPoints;
          const available = reward.stock === null || reward.stock > 0;
          let availabilityLabel = `${reward.stock} remaining`;
          let buttonLabel = "Redeem";

          if (reward.stock === null) {
            availabilityLabel = "Always available";
          }

          if (!available) {
            buttonLabel = "Out of stock";
          } else if (!affordable) {
            buttonLabel = "More points needed";
          } else if (redeeming === reward.id) {
            buttonLabel = "Redeeming…";
          }

          return (
            <Surface as="article" className="reward-card" key={reward.id}>
              <RewardImage imageUrl={reward.imageUrl} name={reward.name} fallback={reward.icon} />
              <Eyebrow>{availabilityLabel}</Eyebrow>
              <Heading>{reward.name}</Heading>
              <Text>{reward.description}</Text>
              <div>
                <Text as="strong">{reward.costPoints} pts</Text>
                <Button
                  disabled={!affordable || !available || redeeming === reward.id}
                  onClick={() => redeem(reward.id)}
                >
                  {buttonLabel}
                </Button>
              </div>
            </Surface>
          );
        })}
      </div>
    </>
  );
}
