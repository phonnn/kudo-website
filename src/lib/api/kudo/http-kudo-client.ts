import type { FeedPostView } from "@/features/feed/types";
import type { PresignedUploadView, SendKudoCommand } from "@/features/kudo/types";
import type { UserClient } from "../user/user-client.interface";
import type { HttpTransport } from "../http/http-transport";
import type { KudoClient } from "./kudo-client.interface";

export class HttpKudoClient implements KudoClient {
  constructor(
    private readonly transport: HttpTransport,
    private readonly users: UserClient,
  ) {}

  async getBudget() {
    const balance = await this.transport.request<{ givingRemaining: number }>("/balance");

    return {
      remaining: balance.givingRemaining,
      spent: Math.max(0, 200 - balance.givingRemaining),
      total: 200,
    };
  }

  async sendKudo(command: SendKudoCommand, idempotencyKey: string) {
    const created = await this.transport.request<{ postId: string }>("/kudos", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({
        recipientId: command.recipientId,
        points: command.points,
        tag: command.tag,
        description: command.message,
        media: command.media,
      }),
    });
    const sender = await this.users.getMe();

    return {
      id: created.postId,
      sender,
      recipient: { id: command.recipientId, name: "Teammate", initials: "TM" },
      message: command.message,
      points: command.points,
      tag: command.tag,
      createdAt: new Date().toISOString(),
      media: command.media,
      reactionCount: 0,
      commentCount: 0,
      myReaction: null,
      comments: [],
    } satisfies FeedPostView;
  }

  presignMedia(contentType: string) {
    return this.transport.request<PresignedUploadView>("/media/presign", {
      method: "POST",
      body: JSON.stringify({ contentType }),
    });
  }

  async uploadMedia(upload: PresignedUploadView, file: File) {
    const form = new FormData();

    Object.entries(upload.fields).forEach(([key, value]) => {
      form.append(key, value);
    });
    form.append("file", file);

    const response = await fetch(upload.url, { method: "POST", body: form });

    if (!response.ok) {
      throw new Error("Media upload failed");
    }
  }
}
