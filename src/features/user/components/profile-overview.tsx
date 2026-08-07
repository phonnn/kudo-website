"use client";

import type { ReactNode } from "react";
import { useProfile } from "../hooks/use-profile";
import { Avatar } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));

function pointSign(delta: number) {
  if (delta > 0) {
    return "+";
  }

  return "−";
}

function pointClassName(delta: number) {
  if (delta > 0) {
    return "positive";
  }

  return "";
}

export function ProfileOverview() {
  const { user, points, redemptions, history } = useProfile();
  const hasError = user.isError || points.isError || redemptions.isError || history.isError;
  if (hasError) {
    return <EmptyState>Could not load your profile.</EmptyState>;
  }

  let redemptionHistory: ReactNode = <EmptyState>You have not redeemed a reward yet.</EmptyState>;

  if (redemptions.isPending) {
    redemptionHistory = <EmptyState>Loading redemptions…</EmptyState>;
  } else if (redemptions.data?.length) {
    redemptionHistory = (
      <Surface className="history-list">
        {redemptions.data.map((item) => (
          <article className="history-row" key={item.id}>
            <div className="reward-icon" aria-hidden="true">
              ↗
            </div>
            <div>
              <Text as="strong">{item.rewardName}</Text>
              <Text as="small">{formatDate(item.redeemedAt)}</Text>
            </div>
            <Text as="span" className={`status status-${item.status}`}>
              {item.status}
            </Text>
            <Text as="b">−{item.points} pts</Text>
          </article>
        ))}
      </Surface>
    );
  }

  return (
    <>
      <Surface as="section" className="profile-summary">
        <Avatar className="profile-avatar" initials={user.data?.initials ?? "…"} size="large" />
        <div className="profile-identity">
          <Eyebrow>Your profile</Eyebrow>
          <Heading as="h1">{user.data?.name ?? "Loading…"}</Heading>
          <Text>Your recognition points and reward activity in one place.</Text>
        </div>
        <div className="points-balance">
          <Text as="span">Available points</Text>
          <Text as="strong">{points.data?.earned ?? "—"}</Text>
          <Text as="small">Ready to redeem</Text>
        </div>
      </Surface>
      <section className="profile-stats" aria-label="Point summary">
        <Surface className="stat">
          <Text as="span">Lifetime earned</Text>
          <Text as="strong">{points.data?.lifetimeEarned ?? "—"}</Text>
        </Surface>
        <Surface className="stat">
          <Text as="span">Lifetime redeemed</Text>
          <Text as="strong">{points.data?.lifetimeRedeemed ?? "—"}</Text>
        </Surface>
        <Surface className="stat">
          <Text as="span">Rewards claimed</Text>
          <Text as="strong">{redemptions.data?.length ?? "—"}</Text>
        </Surface>
      </section>
      <section className="history-section">
        <SectionHeading eyebrow="Point activity" title="Point history" />
        <Surface className="history-list point-history">
          {history.data?.map((item) => (
            <article className="history-row" key={item.id}>
              <div className="reward-icon">{pointSign(item.delta)}</div>
              <div>
                <Text as="strong">{item.label}</Text>
                <Text as="small">{formatDate(item.createdAt)}</Text>
              </div>
              <Text as="span" className={`point-type point-${item.type}`}>
                {item.type}
              </Text>
              <Text as="b" className={pointClassName(item.delta)}>
                {pointSign(item.delta)}
                {Math.abs(item.delta)} pts
              </Text>
            </article>
          ))}
        </Surface>
      </section>
      <section className="history-section">
        <SectionHeading eyebrow="Reward activity" title="Redemption history" />
        {redemptionHistory}
      </section>
    </>
  );
}
