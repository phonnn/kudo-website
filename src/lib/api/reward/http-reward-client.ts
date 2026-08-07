import type { RedemptionView } from "@/features/reward/types";
import type { HttpTransport } from "../http/http-transport";
import type { RewardClient } from "./reward-client.interface";

export class HttpRewardClient implements RewardClient {
  constructor(private readonly transport: HttpTransport) {}

  async getRewards() {
    const items =
      await this.transport.request<
        Array<{ id: string; name: string; costPoints: number; stock: number | null }>
      >("/rewards");

    return items.map((item) => ({
      ...item,
      description: "A reward for work worth celebrating.",
      icon: "★",
    }));
  }

  async redeemReward(rewardId: string, idempotencyKey: string) {
    const result = await this.transport.request<{
      redemptionId: string;
      status: "confirmed" | "failed";
    }>(`/rewards/${rewardId}/redeem`, {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
    });
    const reward = (await this.getRewards()).find((item) => item.id === rewardId);
    let status: RedemptionView["status"] = "cancelled";

    if (result.status === "confirmed") {
      status = "fulfilled";
    }

    return {
      id: result.redemptionId,
      rewardName: reward?.name ?? "Reward",
      points: reward?.costPoints ?? 0,
      status,
      redeemedAt: new Date().toISOString(),
    };
  }
}
