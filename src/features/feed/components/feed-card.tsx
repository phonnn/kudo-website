"use client";
/* eslint-disable @next/next/no-img-element -- image hosts are supplied dynamically by the storage provider */

import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";
import { useToast } from "@/components/ui/toast-provider";
import type { CommentView, FeedPostView, ReactionType } from "@/features/feed/types";
import type { Page } from "@/lib/api/shared-types";
import { useApi } from "@/providers/app-providers";

const reactionIcons: Record<ReactionType, string> = {
  like: "👍",
  celebrate: "🎉",
  clap: "👏",
  love: "♥",
};

const defaultCommentCount = 2;

function relative(iso: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (minutes < 1440) {
    return `${Math.round(minutes / 60)}h ago`;
  }

  return `${Math.round(minutes / 1440)}d ago`;
}

function tagLabel(tag: FeedPostView["tag"]) {
  const labels = {
    teamwork: "Better together",
    ownership: "Own the outcome",
    innovation: "Keep innovating",
    customer_focus: "Customer first",
  };

  return labels[tag];
}

function reactionClassName(selected: boolean) {
  if (selected) {
    return "selected";
  }

  return "";
}

export function FeedCard({ post }: { post: FeedPostView }) {
  const api = useApi();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentFormOpen, setCommentFormOpen] = useState(false);
  const [comment, setComment] = useState("");

  const commentsQuery = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => api.getComments(post.id),
    enabled: post.commentCount > 0,
  });

  function patch(next: FeedPostView) {
    queryClient.setQueryData<Page<FeedPostView>>(["feed"], (old) => {
      if (!old) {
        return old;
      }

      const items = old.items.map((item) => {
        if (item.id === next.id) {
          return next;
        }

        return item;
      });

      return { ...old, items };
    });
  }

  async function react(type: ReactionType) {
    let nextType: ReactionType | null = type;

    if (post.myReaction === type) {
      nextType = null;
    }

    let reactionCount = post.reactionCount;

    if (!post.myReaction && nextType) {
      reactionCount += 1;
    }

    if (post.myReaction && !nextType) {
      reactionCount -= 1;
    }

    patch({ ...post, myReaction: nextType, reactionCount });

    try {
      await api.setReaction(post.id, nextType);
    } catch (reason) {
      patch(post);
      showToast(actionErrorMessage(reason, "Could not update your reaction."));
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();

    const body = comment.trim();

    if (!body) {
      return;
    }

    try {
      const created = await api.addComment(post.id, body);

      queryClient.setQueryData<CommentView[]>(["comments", post.id], (old) => [
        ...(old ?? []),
        created,
      ]);
      patch({ ...post, commentCount: post.commentCount + 1 });
      setComment("");
      setCommentsExpanded(true);
      setCommentFormOpen(true);
    } catch (reason) {
      showToast(actionErrorMessage(reason, "Could not post your comment."));
    }
  }

  function resolveMediaUrl() {
    if (!post.media) {
      return null;
    }

    if (post.media.previewUrl) {
      return post.media.previewUrl;
    }

    const domain = post.media.domain.replace(/\/$/, "");
    return `${domain}/${post.media.objectKey}`;
  }

  function toggleCommentForm() {
    setCommentFormOpen((value) => !value);
  }

  function showMoreComments() {
    setCommentsExpanded(true);
  }

  const mediaUrl = resolveMediaUrl();
  const loadedComments = commentsQuery.data ?? [];
  let visibleComments = loadedComments.slice(-defaultCommentCount);

  if (commentsExpanded) {
    visibleComments = loadedComments;
  }

  const hasMoreComments = post.commentCount > defaultCommentCount && !commentsExpanded;
  const showCommentSection = post.commentCount > 0 || commentFormOpen;

  return (
    <Surface as="article" className="post">
      <div className="post-head">
        <Avatar initials={post.sender.initials} />
        <div>
          <Text as="strong">{post.sender.name}</Text> recognized{" "}
          <Text as="strong">{post.recipient.name}</Text>
          <Text as="small">{relative(post.createdAt)}</Text>
        </div>
        <Text as="span" className="points">
          +{post.points}
        </Text>
      </div>

      <Text>{post.message}</Text>
      {mediaUrl && <img className="post-media" src={mediaUrl} alt="Recognition attachment" />}
      <Text as="span" className="value">
        {tagLabel(post.tag)}
      </Text>

      <div className="post-actions">
        <div>
          {(Object.keys(reactionIcons) as ReactionType[]).map((type) => (
            <Button
              variant="ghost"
              className={reactionClassName(post.myReaction === type)}
              key={type}
              onClick={() => react(type)}
              aria-label={type}
            >
              {reactionIcons[type]}
            </Button>
          ))}
          <Text as="span">{post.reactionCount}</Text>
        </div>

        <Button variant="ghost" onClick={toggleCommentForm}>
          Comment · {post.commentCount}
        </Button>
      </div>

      {showCommentSection && (
        <div className="comments">
          {visibleComments.map((item) => (
            <div className="comment" key={item.id}>
              <Avatar initials={item.author.initials} size="small" />
              <div>
                <div className="comment-meta">
                  <Text as="strong">{item.author.name}</Text>
                  <Text as="small">{relative(item.createdAt)}</Text>
                </div>
                <Text>{item.body}</Text>
              </div>
            </div>
          ))}

          {hasMoreComments && (
            <Button variant="ghost" className="comments-more" onClick={showMoreComments}>
              See more comments
            </Button>
          )}

          {commentFormOpen && (
            <form onSubmit={submitComment}>
              <Input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                placeholder="Write a comment…"
              />
              <Button type="submit">Post</Button>
            </form>
          )}
        </div>
      )}
    </Surface>
  );
}

function actionErrorMessage(reason: unknown, fallback: string) {
  if (reason instanceof Error) {
    return reason.message;
  }

  return fallback;
}
