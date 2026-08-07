"use client";
/* eslint-disable @next/next/no-img-element -- image hosts are supplied dynamically by the storage provider */

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { Text } from "@/components/ui/text";
import type { FeedPostView, ReactionType } from "@/features/feed/types";
import type { Page } from "@/lib/api/shared-types";
import { useApi } from "@/providers/app-providers";

const reactionIcons: Record<ReactionType, string> = {
  like: "👍",
  celebrate: "🎉",
  clap: "👏",
  love: "♥",
};

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
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

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
    } catch {
      patch(post);
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();

    const body = comment.trim();

    if (!body) {
      return;
    }

    const created = await api.addComment(post.id, body);

    patch({ ...post, comments: [...post.comments, created], commentCount: post.commentCount + 1 });
    setComment("");
    setShowComments(true);
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

  function toggleComments() {
    setShowComments((value) => !value);
  }

  const mediaUrl = resolveMediaUrl();

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

        <Button variant="ghost" onClick={toggleComments}>
          Comment · {post.commentCount}
        </Button>
      </div>

      {showComments && (
        <div className="comments">
          {post.comments.map((item) => (
            <div className="comment" key={item.id}>
              <Avatar initials={item.author.initials} size="small" />
              <div>
                <Text as="strong">{item.author.name}</Text>
                <Text>{item.body}</Text>
              </div>
            </div>
          ))}

          <form onSubmit={submitComment}>
            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={1000}
              placeholder="Write a comment…"
            />
            <Button type="submit">Post</Button>
          </form>
        </div>
      )}
    </Surface>
  );
}
