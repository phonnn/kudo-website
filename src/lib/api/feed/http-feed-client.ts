import type { FeedPostView, ReactionType, RealtimeFeedEvent } from "@/features/feed/types";
import type { Tag } from "@/features/kudo/types";
import type { UserClient } from "../user/user-client.interface";
import type { HttpTransport } from "../http/http-transport";
import type { FeedClient } from "./feed-client.interface";

type FeedResponse = {
  items: Array<{
    id: string;
    body: string;
    authorId: string;
    authorName: string;
    commentCount: number;
    reactionCount: number;
    createdAt: string;
    myReaction?: ReactionType | null;
    media: { objectKey: string; domain: string } | null;
    kudo: {
      recipientId: string;
      recipientName: string;
      points: number;
      tag: Tag;
    } | null;
  }>;
  nextCursor: string | null;
};

export class HttpFeedClient implements FeedClient {
  constructor(
    private readonly transport: HttpTransport,
    private readonly users: UserClient,
  ) {}

  async getFeed(cursor?: string) {
    let path = "/kudos?limit=20";

    if (cursor) {
      path += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const page = await this.transport.request<FeedResponse>(path);

    return {
      nextCursor: page.nextCursor,
      items: page.items.filter(hasKudo).map(toFeedPost),
    };
  }

  async getComments(postId: string, limit?: number) {
    let path = `/kudos/${postId}/comments`;

    if (limit) {
      path += `?limit=${limit}`;
    }

    const comments = await this.transport.request<
      Array<{
        id: string;
        postId: string;
        authorId: string;
        authorName: string;
        body: string;
        createdAt: string;
      }>
    >(path);

    return comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      author: {
        id: comment.authorId,
        name: comment.authorName,
        initials: comment.authorName.slice(0, 2).toUpperCase(),
      },
      body: comment.body,
      createdAt: comment.createdAt,
    }));
  }

  async addComment(postId: string, body: string) {
    const result = await this.transport.request<{
      id: string;
      postId: string;
      authorId: string;
      body: string;
      createdAt: string;
    }>(`/kudos/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });

    return { ...result, author: await this.users.getMe() };
  }

  async setReaction(postId: string, type: ReactionType | null) {
    if (type) {
      await this.transport.request<void>(`/kudos/${postId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      return;
    }

    await this.transport.request<void>(`/kudos/${postId}/reactions`, {
      method: "DELETE",
    });
  }

  subscribeFeed(listener: (event: RealtimeFeedEvent) => void) {
    return this.transport.eventSource("/kudos/events", {
      "post.published": (data) => {
        listener({
          type: "post.published",
          post: toFeedPost(data as FeedItemWithKudo),
        });
      },
      "post.updated": (data) => {
        const update = data as Extract<RealtimeFeedEvent, { type: "post.updated" }>;

        listener({
          ...update,
          type: "post.updated",
        });
      },
    });
  }
}

type FeedItem = FeedResponse["items"][number];
type FeedItemWithKudo = FeedItem & { kudo: NonNullable<FeedItem["kudo"]> };

function hasKudo(item: FeedItem): item is FeedItemWithKudo {
  return Boolean(item.kudo);
}

function toFeedPost(item: FeedItemWithKudo): FeedPostView {
  return {
    id: item.id,
    sender: {
      id: item.authorId,
      name: item.authorName,
      initials: item.authorName.slice(0, 2).toUpperCase(),
    },
    recipient: {
      id: item.kudo.recipientId,
      name: item.kudo.recipientName,
      initials: item.kudo.recipientName.slice(0, 2).toUpperCase(),
    },
    message: item.body,
    points: item.kudo.points,
    tag: item.kudo.tag,
    createdAt: item.createdAt,
    media: item.media ?? undefined,
    commentCount: item.commentCount,
    reactionCount: item.reactionCount,
    myReaction: item.myReaction ?? null,
    comments: [],
  };
}
