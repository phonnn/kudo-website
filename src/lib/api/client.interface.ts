import type { AuthClient } from "./auth/auth-client.interface";
import type { FeedClient } from "./feed/feed-client.interface";
import type { KudoClient } from "./kudo/kudo-client.interface";
import type { NotificationClient } from "./notification/notification-client.interface";
import type { RewardClient } from "./reward/reward-client.interface";
import type { UserClient } from "./user/user-client.interface";

export interface ApiClient
  extends AuthClient, FeedClient, KudoClient, NotificationClient, RewardClient, UserClient {}
