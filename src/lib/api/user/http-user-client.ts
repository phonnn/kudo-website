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

  async getUsers() {
    return [await this.getMe()];
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
    return [];
  }

  async getRedemptionHistory() {
    return [];
  }
}
