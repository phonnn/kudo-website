import { AppShell } from "@/components/app-shell";
import { RewardCatalog } from "@/features/reward/components/reward-catalog";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
export default function RewardsPage() {
  return (
    <AppShell active="rewards">
      <section className="rewards-hero">
        <Eyebrow>Recognition pays forward</Eyebrow>
        <Heading as="h1">Choose something good.</Heading>
        <Text>Use the points you have earned to pick a reward that feels right.</Text>
      </section>
      <RewardCatalog />
    </AppShell>
  );
}
