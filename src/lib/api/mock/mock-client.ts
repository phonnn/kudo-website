import type { ApiClient } from "@/lib/api/client.interface";
import { ApiError } from "@/lib/errors/api-error";
import type { AuthCommand } from "@/features/auth/types";
import type { FeedPostView, ReactionType, RealtimeFeedEvent } from "@/features/feed/types";
import type { SendKudoCommand } from "@/features/kudo/types";
import type { NotificationView } from "@/features/notification/types";
import type { RedemptionView, RewardView } from "@/features/reward/types";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const ago = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const users = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Alex Morgan",
    initials: "AM",
    email: "alex@goodjob.dev",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Maya Chen",
    initials: "MC",
    email: "maya@goodjob.dev",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Sam Rivera",
    initials: "SR",
    email: "sam@goodjob.dev",
  },
];
const rewards: RewardView[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Coffee on us",
    description: "A $10 voucher for your favorite local café.",
    costPoints: 100,
    stock: null,
    icon: "☕",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Team lunch",
    description: "Put 175 points toward lunch with your team.",
    costPoints: 175,
    stock: 8,
    icon: "🍜",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Extra day off",
    description: "Take a well-earned additional day to recharge.",
    costPoints: 500,
    stock: 2,
    icon: "🌿",
  },
  {
    id: "10000000-0000-4000-8000-000000000004",
    name: "Charity donation",
    description: "Turn recognition into a donation to a cause.",
    costPoints: 60,
    stock: null,
    icon: "♥",
  },
];

const initialFeed: FeedPostView[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    sender: users[1],
    recipient: users[2],
    message:
      "Thank you for jumping in to unblock the launch. Your calm ownership made a real difference.",
    points: 25,
    tag: "ownership",
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    reactionCount: 8,
    commentCount: 3,
    myReaction: "clap",
    comments: [
      {
        id: "c1",
        postId: "20000000-0000-4000-8000-000000000001",
        author: users[0],
        body: "Absolutely deserved — brilliant work!",
        createdAt: ago(0),
      },
      {
        id: "c2",
        postId: "20000000-0000-4000-8000-000000000001",
        author: users[1],
        body: "You made a difficult launch feel effortless.",
        createdAt: ago(0),
      },
      {
        id: "c3",
        postId: "20000000-0000-4000-8000-000000000001",
        author: users[2],
        body: "Thank you both. It was a real team effort!",
        createdAt: ago(0),
      },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    sender: users[0],
    recipient: users[1],
    message: "The customer walkthrough was thoughtful, clear, and full of empathy. Brilliant work!",
    points: 15,
    tag: "customer_focus",
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    reactionCount: 5,
    commentCount: 0,
    myReaction: null,
    comments: [],
  },
];

export class MockApiClient implements ApiClient {
  private feed = [...initialFeed];
  private remaining = 100;
  private earned = 340;
  private me = users[0];
  private feedListeners = new Set<(event: RealtimeFeedEvent) => void>();
  private notificationListeners = new Set<(event: NotificationView) => void>();
  private redemptions: RedemptionView[] = [
    { id: "r1", rewardName: "Coffee on us", points: 100, status: "fulfilled", redeemedAt: ago(5) },
    { id: "r2", rewardName: "Team lunch", points: 75, status: "pending", redeemedAt: ago(16) },
    {
      id: "r3",
      rewardName: "Charity donation",
      points: 60,
      status: "fulfilled",
      redeemedAt: ago(42),
    },
  ];
  private notifications: NotificationView[] = [
    {
      id: "n1",
      type: "kudo_received",
      message: "Maya sent you 25 points for Ownership.",
      readAt: null,
      createdAt: new Date(Date.now() - 9 * 60_000).toISOString(),
    },
    {
      id: "n2",
      type: "comment",
      message: "Sam commented on your recognition post.",
      readAt: null,
      createdAt: new Date(Date.now() - 70 * 60_000).toISOString(),
    },
    {
      id: "n3",
      type: "reaction",
      message: "Maya celebrated your post.",
      readAt: ago(1),
      createdAt: ago(1),
    },
  ];

  async getMe() {
    await delay();
    return this.me;
  }
  async getUsers(search?: string) {
    await delay(120);

    const teammates = users.filter((user) => user.id !== this.me.id);

    if (!search) {
      return teammates.slice(0, 10);
    }

    const normalizedSearch = search.trim().toLowerCase();

    return teammates
      .filter((user) => user.name.toLowerCase().includes(normalizedSearch))
      .slice(0, 10);
  }
  async login(command: AuthCommand) {
    await delay(400);
    if (!command.email || !command.password) {
      throw new ApiError("INTERNAL", "Enter your email and password.");
    }
    return { user: this.me, accessToken: "mock-access", refreshToken: "mock-refresh" };
  }
  async register(command: AuthCommand) {
    await delay(450);
    this.me = {
      id: crypto.randomUUID(),
      name: command.name ?? "New teammate",
      email: command.email,
      initials: initials(command.name ?? "New teammate"),
    };
    return { user: this.me, accessToken: "mock-access", refreshToken: "mock-refresh" };
  }
  logout() {}
  async getBudget() {
    await delay();
    return { spent: 100 - this.remaining, remaining: this.remaining, total: 100 };
  }
  async getPointBalance() {
    await delay();
    return {
      earned: this.earned,
      givingRemaining: this.remaining,
      lifetimeEarned: 575,
      lifetimeRedeemed: 235,
    };
  }
  async getPointHistory() {
    await delay();
    return [
      {
        id: "p1",
        label: "Kudo from Maya Chen",
        delta: 25,
        type: "earned" as const,
        createdAt: ago(1),
      },
      {
        id: "p2",
        label: "Coffee on us",
        delta: -100,
        type: "redeemed" as const,
        createdAt: ago(5),
      },
      {
        id: "p3",
        label: "Kudo to Sam Rivera",
        delta: -25,
        type: "given" as const,
        createdAt: ago(8),
      },
    ];
  }
  async getRedemptionHistory() {
    await delay();
    return [...this.redemptions];
  }
  async getFeed() {
    await delay(300);
    return { items: [...this.feed] };
  }

  async sendKudo(command: SendKudoCommand, idempotencyKey: string) {
    await delay(420);
    if (command.recipientId === this.me.id) {
      throw new ApiError("SELF_RECOGNITION", "You cannot recognize yourself.");
    }

    if (command.points > this.remaining) {
      throw new ApiError("INSUFFICIENT_BUDGET", "Not enough giving budget this month.");
    }
    const recipient = users.find((user) => user.id === command.recipientId);
    if (!recipient) {
      throw new ApiError("INTERNAL", "Recipient not found.");
    }
    const existing = this.feed.find((item) => item.id === idempotencyKey);
    if (existing) {
      return existing;
    }
    const post: FeedPostView = {
      id: crypto.randomUUID(),
      sender: this.me,
      recipient,
      message: command.message,
      points: command.points,
      tag: command.tag,
      createdAt: new Date().toISOString(),
      media: command.media,
      reactionCount: 0,
      commentCount: 0,
      myReaction: null,
      comments: [],
    };
    this.remaining -= command.points;
    this.feed.unshift(post);
    this.feedListeners.forEach((listener) => listener({ type: "post.published", postId: post.id }));
    return post;
  }

  async addComment(postId: string, body: string) {
    await delay();
    const post = this.feed.find((item) => item.id === postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const comment = {
      id: crypto.randomUUID(),
      postId,
      author: this.me,
      body,
      createdAt: new Date().toISOString(),
    };
    post.comments.push(comment);
    post.commentCount += 1;
    this.feedListeners.forEach((listener) =>
      listener({ type: "post.updated", postId, commentCount: post.commentCount }),
    );
    return comment;
  }
  async setReaction(postId: string, type: ReactionType | null) {
    await delay(120);
    const post = this.feed.find((item) => item.id === postId);
    if (!post) {
      return;
    }
    if (!post.myReaction && type) {
      post.reactionCount += 1;
    }

    if (post.myReaction && !type) {
      post.reactionCount -= 1;
    }
    post.myReaction = type;
    this.feedListeners.forEach((listener) =>
      listener({ type: "post.updated", postId, reactionCount: post.reactionCount }),
    );
  }
  async presignMedia() {
    return {
      url: "mock://upload",
      fields: {},
      objectKey: crypto.randomUUID(),
      domain: "mock://media",
    };
  }
  async uploadMedia() {
    await delay(250);
  }
  async subscribeFeed(listener: (event: RealtimeFeedEvent) => void) {
    this.feedListeners.add(listener);
    return () => this.feedListeners.delete(listener);
  }
  async getNotifications() {
    await delay();
    return { items: [...this.notifications] };
  }
  async markNotificationRead(id: string) {
    const item = this.notifications.find((notification) => notification.id === id);
    if (item) {
      item.readAt = new Date().toISOString();
    }
  }
  async subscribeNotifications(listener: (event: NotificationView) => void) {
    this.notificationListeners.add(listener);
    return () => this.notificationListeners.delete(listener);
  }
  async getRewards() {
    await delay();
    return rewards;
  }
  async redeemReward(rewardId: string) {
    await delay(450);
    const reward = rewards.find((item) => item.id === rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }
    if (this.earned < reward.costPoints) {
      throw new ApiError("INSUFFICIENT_BUDGET", "You need more points for this reward.");
    }
    this.earned -= reward.costPoints;
    const item: RedemptionView = {
      id: crypto.randomUUID(),
      rewardName: reward.name,
      points: reward.costPoints,
      status: "fulfilled",
      redeemedAt: new Date().toISOString(),
    };
    this.redemptions.unshift(item);
    return item;
  }
}
