"use client";

import { useProfile } from "../hooks/use-profile";

const formatDate = (iso: string) => new Intl.DateTimeFormat("en", {
  day: "numeric", month: "short", year: "numeric",
}).format(new Date(iso));

export function ProfileOverview() {
  const { user, points, redemptions } = useProfile();
  const hasError = user.isError || points.isError || redemptions.isError;
  if (hasError) return <div className="card empty">Could not load your profile.</div>;

  return <>
    <section className="profile-summary card">
      <div className="profile-avatar">{user.data?.initials ?? "…"}</div>
      <div className="profile-identity"><div className="eyebrow">Your profile</div><h1>{user.data?.name ?? "Loading…"}</h1><p>Your recognition points and reward activity in one place.</p></div>
      <div className="points-balance"><span>Available points</span><strong>{points.data?.earned ?? "—"}</strong><small>Ready to redeem</small></div>
    </section>
    <section className="profile-stats" aria-label="Point summary">
      <div className="card stat"><span>Lifetime earned</span><strong>{points.data?.lifetimeEarned ?? "—"}</strong></div>
      <div className="card stat"><span>Lifetime redeemed</span><strong>{points.data?.lifetimeRedeemed ?? "—"}</strong></div>
      <div className="card stat"><span>Rewards claimed</span><strong>{redemptions.data?.length ?? "—"}</strong></div>
    </section>
    <section className="history-section">
      <div className="section-title"><div><div className="eyebrow">Reward activity</div><h2>Redemption history</h2></div></div>
      {redemptions.isPending ? <div className="card empty">Loading redemptions…</div> : redemptions.data?.length ? <div className="card history-list">{redemptions.data.map((item) => <article className="history-row" key={item.id}><div className="reward-icon" aria-hidden="true">↗</div><div><strong>{item.rewardName}</strong><small>{formatDate(item.redeemedAt)}</small></div><span className={`status status-${item.status}`}>{item.status}</span><b>−{item.points} pts</b></article>)}</div> : <div className="card empty">You have not redeemed a reward yet.</div>}
    </section>
  </>;
}
