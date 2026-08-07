import type { MediaView, Tag } from "@/features/kudo/types";
import type { UserView } from "@/features/user/types";

export type ReactionType = "like" | "celebrate" | "clap" | "love";

export type CommentView = {
  id: string;
  postId: string;
  author: UserView;
  body: string;
  createdAt: string;
};

export type FeedPostView = {
  id: string;
  sender: UserView;
  recipient: UserView;
  message: string;
  points: number;
  tag: Tag;
  createdAt: string;
  media?: MediaView;
  reactionCount: number;
  commentCount: number;
  myReaction: ReactionType | null;
  comments: CommentView[];
};

export type RealtimeFeedEvent = {
  type: "post.published" | "post.updated";
  postId: string;
  commentCount?: number;
  reactionCount?: number;
};
