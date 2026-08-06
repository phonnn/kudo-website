import type {
  BudgetView,
  FeedPostView,
  Page,
  SendKudoCommand,
  UserView,
} from "@/features/kudo/types";

export interface ApiClient {
  getMe(): Promise<UserView>;
  getUsers(): Promise<UserView[]>;
  getBudget(): Promise<BudgetView>;
  getFeed(cursor?: string): Promise<Page<FeedPostView>>;
  sendKudo(command: SendKudoCommand, idempotencyKey: string): Promise<FeedPostView>;
}
