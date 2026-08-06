"use client";

import { useFeed } from "../hooks/use-feed";

const relative = (iso: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`;
};

export function FeedList() {
  const feed = useFeed();
  if (feed.isPending) return <div className="card empty">Loading recognition…</div>;
  if (feed.isError) return <div className="card empty">Could not load the feed.</div>;
  if (!feed.data.items.length) return <div className="card empty">Be the first to recognize someone.</div>;

  return <div className="feed">{feed.data.items.map((post) => (
    <article className="card post" key={post.id}>
      <div className="post-head"><span className="avatar">{post.sender.initials}</span><div><strong>{post.sender.name}</strong> recognized <strong>{post.recipient.name}</strong><small>{relative(post.createdAt)}</small></div><span className="points">+{post.points}</span></div>
      <p>{post.message}</p>
      <span className="value">{post.coreValue}</span>
    </article>
  ))}</div>;
}
