import type { RedemptionView, RewardView } from "@/features/reward/types";

export interface RewardClient {
  getRewards(): Promise<RewardView[]>;
  redeemReward(rewardId: string, idempotencyKey: string): Promise<RedemptionView>;
}
