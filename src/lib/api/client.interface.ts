import type {
  BudgetView,
  FeedPostView,
  Page,
  PointBalanceView,
  RedemptionView,
  SendKudoCommand,
  UserView,
} from "@/features/kudo/types";

export interface ApiClient {
  getMe(): Promise<UserView>;
  getUsers(): Promise<UserView[]>;
  getBudget(): Promise<BudgetView>;
  getPointBalance(): Promise<PointBalanceView>;
  getRedemptionHistory(): Promise<RedemptionView[]>;
  getFeed(cursor?: string): Promise<Page<FeedPostView>>;
  sendKudo(command: SendKudoCommand, idempotencyKey: string): Promise<FeedPostView>;
}
