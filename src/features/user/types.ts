import type { RedemptionView } from "@/features/reward/types";

export type UserView = {
  id: string;
  name: string;
  initials: string;
  email?: string;
};

export type PointBalanceView = {
  earned: number;
  givingRemaining: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
};

export type PointHistoryView = {
  id: string;
  label: string;
  delta: number;
  type: "earned" | "redeemed" | "given";
  createdAt: string;
};

export type RedemptionHistoryView = RedemptionView[];
