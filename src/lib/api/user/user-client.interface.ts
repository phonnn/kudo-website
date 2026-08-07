import type { RedemptionView } from "@/features/reward/types";
import type { PointBalanceView, PointHistoryView, UserView } from "@/features/user/types";

export interface UserClient {
  getMe(): Promise<UserView>;
  getUsers(search?: string): Promise<UserView[]>;
  getPointBalance(): Promise<PointBalanceView>;
  getPointHistory(): Promise<PointHistoryView[]>;
  getRedemptionHistory(): Promise<RedemptionView[]>;
}
