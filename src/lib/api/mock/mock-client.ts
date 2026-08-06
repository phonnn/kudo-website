import type { ApiClient } from "@/lib/api/client.interface";
import { ApiError } from "@/lib/errors/api-error";
import type { FeedPostView, SendKudoCommand } from "@/features/kudo/types";

const delay = (milliseconds = 250) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const users = [
  { id: "u1", name: "Alex Morgan", initials: "AM" },
  { id: "u2", name: "Maya Chen", initials: "MC" },
  { id: "u3", name: "Sam Rivera", initials: "SR" },
];

const initialFeed: FeedPostView[] = [
  {
    id: "k1",
    sender: users[1],
    recipient: users[2],
    message: "Thank you for jumping in to unblock the launch. Your calm ownership made a real difference.",
    points: 25,
    coreValue: "Own the outcome",
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "k2",
    sender: users[0],
    recipient: users[1],
    message: "The customer walkthrough was thoughtful, clear, and full of empathy. Brilliant work!",
    points: 15,
    coreValue: "Customer first",
    createdAt: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
  },
];

export class MockApiClient implements ApiClient {
  private feed = [...initialFeed];
  private remaining = 100;
  private readonly requests = new Map<string, FeedPostView>();

  async getMe() {
    await delay();
    return users[0];
  }

  async getUsers() {
    await delay(150);
    return users;
  }

  async getBudget() {
    await delay(180);
    return { spent: 100 - this.remaining, remaining: this.remaining, total: 100 };
  }

  async getFeed() {
    await delay(350);
    return { items: [...this.feed] };
  }

  async sendKudo(command: SendKudoCommand, idempotencyKey: string) {
    await delay(450);
    const duplicate = this.requests.get(idempotencyKey);
    if (duplicate) return duplicate;
    if (command.recipientId === users[0].id) {
      throw new ApiError("SELF_RECOGNITION", "You cannot recognize yourself.");
    }
    if (command.points > this.remaining) {
      throw new ApiError("INSUFFICIENT_BUDGET", "Not enough giving budget this month.");
    }
    const recipient = users.find((user) => user.id === command.recipientId);
    if (!recipient) throw new ApiError("INTERNAL", "Recipient not found.");

    const post: FeedPostView = {
      id: crypto.randomUUID(),
      sender: users[0],
      recipient,
      message: command.message,
      points: command.points,
      coreValue: command.coreValue,
      createdAt: new Date().toISOString(),
    };
    this.remaining -= command.points;
    this.feed.unshift(post);
    this.requests.set(idempotencyKey, post);
    return post;
  }
}
