"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  const [fresh, setFresh] = useState(false);

  useEffect(() => {
    let disconnect: (() => void) | undefined;

    api
      .subscribeFeed((event) => {
        if (event.type === "post.published") {
          setFresh(true);
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
        disconnect = stop;
      });

    return () => disconnect?.();
  }, [api, queryClient]);

  async function refreshFeed() {
    await feed.refetch();
    setFresh(false);
  }

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
      {fresh && (
        <Button variant="ghost" className="new-posts" onClick={refreshFeed}>
          New recognition — refresh feed
        </Button>
      )}

      <div className="feed">
        {feed.data.items.map((post) => (
          <FeedCard key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
