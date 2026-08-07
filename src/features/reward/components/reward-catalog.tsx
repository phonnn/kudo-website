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

export function RewardCatalog() {
  const api = useApi();
  const queryClient = useQueryClient();
  const rewards = useQuery({ queryKey: ["rewards"], queryFn: () => api.getRewards() });
  const balance = useQuery({ queryKey: ["points", "me"], queryFn: () => api.getPointBalance() });
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  async function redeem(id: string) {
    setRedeeming(id);
    setMessage("");

    try {
      const result = await api.redeemReward(id, crypto.randomUUID());
      setMessage(`${result.rewardName} has been redeemed.`);
      await queryClient.invalidateQueries({ queryKey: ["points", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["redemptions", "me"] });
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Could not redeem reward.");
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
      {message && <div className="reward-message">{message}</div>}
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
              <div className="reward-art">{reward.icon}</div>
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
