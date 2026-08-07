"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";
import type { FeedPostView } from "@/features/feed/types";
import type { Page } from "@/lib/api/shared-types";
import { useApi } from "@/providers/app-providers";
import { FeedCard } from "./feed-card";
import { useFeed } from "../hooks/use-feed";

export function FeedList() {
  const feed = useFeed();
  const api = useApi();
  const queryClient = useQueryClient();

  useEffect(() => {
    let disconnect: (() => void) | undefined;
    let disposed = false;

    api
      .subscribeFeed((event) => {
        if (event.type === "post.published") {
          queryClient.setQueryData<Page<FeedPostView>>(["feed"], (old) => {
            if (!old) {
              return { items: [event.post] };
            }

            const previousItems = old.items.filter((post) => {
              return post.id !== event.post.id;
            });

            return {
              ...old,
              items: [event.post, ...previousItems],
            };
          });
          return;
        }

        queryClient.setQueryData<Page<FeedPostView>>(["feed"], (old) => {
          if (!old) {
            return old;
          }

          const items = old.items.map((post) => {
            if (post.id !== event.postId) {
              return post;
            }

            return {
              ...post,
              commentCount: event.commentCount ?? post.commentCount,
              reactionCount: event.reactionCount ?? post.reactionCount,
            };
          });

          return { ...old, items };
        });
      })
      .then((stop) => {
        if (disposed) {
          stop();
          return;
        }

        disconnect = stop;
      });

    return () => {
      disposed = true;
      disconnect?.();
    };
  }, [api, queryClient]);

  if (feed.isPending) {
    return <EmptyState>Loading recognition…</EmptyState>;
  }

  if (feed.isError) {
    return <EmptyState>Could not load the feed.</EmptyState>;
  }

  if (!feed.data.items.length) {
    return <EmptyState>Be the first to recognize someone.</EmptyState>;
  }

  return (
    <>
      <div className="feed">
        {feed.data.items.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
