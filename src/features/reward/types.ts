export type RedemptionView = {
  id: string;
  rewardName: string;
  points: number;
  status: "pending" | "fulfilled" | "cancelled";
  redeemedAt: string;
};

export type RewardView = {
  id: string;
  name: string;
  description: string;
  costPoints: number;
  stock: number | null;
  imageUrl: string | null;
  icon: string;
};
