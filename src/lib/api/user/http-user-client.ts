import type { UserView } from "@/features/user/types";
import { ApiError } from "@/lib/errors/api-error";
import type { HttpTransport } from "../http/http-transport";
import type { UserClient } from "./user-client.interface";

export class HttpUserClient implements UserClient {
  constructor(private readonly transport: HttpTransport) {}

  async getMe() {
    let stored: string | null = null;

    if (typeof window !== "undefined") {
      stored = localStorage.getItem("goodjob.user");
    }

    if (stored) {
      return JSON.parse(stored) as UserView;
    }

    throw new ApiError("INTERNAL", "Sign in to continue.");
  }

  async getUsers(search?: string) {
    let path = "/users?limit=10";

    if (search) {
      path += `&search=${encodeURIComponent(search)}`;
    }

    const page = await this.transport.request<{
      items: Array<{
        id: string;
        name: string;
        createdAt: string;
      }>;
      nextCursor: string | null;
    }>(path);

    return page.items.map((user) => ({
      id: user.id,
      name: user.name,
      initials: user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }));
  }

  async getPointBalance() {
    const balance = await this.transport.request<{
      givingRemaining: number;
      earnedPoints: number;
    }>("/balance");

    return {
      earned: balance.earnedPoints,
      givingRemaining: balance.givingRemaining,
      lifetimeEarned: balance.earnedPoints,
      lifetimeRedeemed: 0,
    };
  }

  async getPointHistory() {
    const page = await this.transport.request<{
      items: Array<{
        id: number;
        delta: number;
        ledgerType: "giving_spend" | "earn" | "redeem_spend" | "reversal" | "adjustment";
        refType: "kudo" | "redemption";
        refId: string;
        createdAt: string;
      }>;
      nextCursor: string | null;
    }>("/balance/history?limit=50");

    return page.items.map((item) => ({
      id: String(item.id),
      label: pointHistoryLabel(item.ledgerType),
      delta: item.delta,
      type: pointHistoryType(item.ledgerType, item.delta),
      createdAt: item.createdAt,
    }));
  }

  async getRedemptionHistory() {
    const page = await this.transport.request<{
      items: Array<{
        id: string;
        rewardId: string;
        rewardName: string;
        costPoints: number;
        status: "confirmed" | "failed";
        createdAt: string;
      }>;
      nextCursor: string | null;
    }>("/rewards/redemptions?limit=50");

    return page.items.map((item) => {
      let status: "fulfilled" | "cancelled" = "cancelled";

      if (item.status === "confirmed") {
        status = "fulfilled";
      }

      return {
        id: item.id,
        rewardName: item.rewardName,
        points: item.costPoints,
        status,
        redeemedAt: item.createdAt,
      };
    });
  }
}

type LedgerType = "giving_spend" | "earn" | "redeem_spend" | "reversal" | "adjustment";

function pointHistoryLabel(ledgerType: LedgerType) {
  if (ledgerType === "giving_spend") {
    return "Recognition sent";
  }

  if (ledgerType === "earn") {
    return "Recognition received";
  }

  if (ledgerType === "redeem_spend") {
    return "Reward redeemed";
  }

  if (ledgerType === "reversal") {
    return "Point reversal";
  }

  return "Point adjustment";
}

function pointHistoryType(ledgerType: LedgerType, delta: number) {
  if (ledgerType === "giving_spend") {
    return "given" as const;
  }

  if (ledgerType === "redeem_spend") {
    return "redeemed" as const;
  }

  if (delta < 0) {
    return "redeemed" as const;
  }

  return "earned" as const;
}
