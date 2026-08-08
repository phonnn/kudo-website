import type {
  CommentView,
  FeedPostView,
  ReactionType,
  RealtimeFeedEvent,
} from "@/features/feed/types";
import type { Page } from "@/lib/api/shared-types";

export interface FeedClient {
  getFeed(cursor?: string): Promise<Page<FeedPostView>>;
  getComments(postId: string, limit?: number): Promise<CommentView[]>;
  addComment(postId: string, body: string): Promise<CommentView>;
  setReaction(postId: string, type: ReactionType | null): Promise<void>;
  subscribeFeed(listener: (event: RealtimeFeedEvent) => void): Promise<() => void>;
}
