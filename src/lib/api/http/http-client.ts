import type { ApiClient } from "../client.interface";
import { HttpAuthClient } from "../auth/http-auth-client";
import { HttpFeedClient } from "../feed/http-feed-client";
import { HttpKudoClient } from "../kudo/http-kudo-client";
import { HttpNotificationClient } from "../notification/http-notification-client";
import { HttpRewardClient } from "../reward/http-reward-client";
import { HttpUserClient } from "../user/http-user-client";
import { HttpTransport } from "./http-transport";

export function createHttpApiClient(baseUrl: string): ApiClient {
  const transport = new HttpTransport(baseUrl);
  const auth = new HttpAuthClient(transport);
  const user = new HttpUserClient(transport);
  const feed = new HttpFeedClient(transport, user);
  const kudo = new HttpKudoClient(transport, user);
  const notification = new HttpNotificationClient(transport);
  const reward = new HttpRewardClient(transport);

  return {
    login: auth.login.bind(auth),
    register: auth.register.bind(auth),
    logout: auth.logout.bind(auth),
    getMe: user.getMe.bind(user),
    getUsers: user.getUsers.bind(user),
    getPointBalance: user.getPointBalance.bind(user),
    getPointHistory: user.getPointHistory.bind(user),
    getRedemptionHistory: user.getRedemptionHistory.bind(user),
    getFeed: feed.getFeed.bind(feed),
    getComments: feed.getComments.bind(feed),
    addComment: feed.addComment.bind(feed),
    setReaction: feed.setReaction.bind(feed),
    subscribeFeed: feed.subscribeFeed.bind(feed),
    getBudget: kudo.getBudget.bind(kudo),
    sendKudo: kudo.sendKudo.bind(kudo),
    presignMedia: kudo.presignMedia.bind(kudo),
    uploadMedia: kudo.uploadMedia.bind(kudo),
    getNotifications: notification.getNotifications.bind(notification),
    markNotificationRead: notification.markNotificationRead.bind(notification),
    subscribeNotifications: notification.subscribeNotifications.bind(notification),
    getRewards: reward.getRewards.bind(reward),
    redeemReward: reward.redeemReward.bind(reward),
  };
}
