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
    return [];
  }

  async getRedemptionHistory() {
    return [];
  }
}
