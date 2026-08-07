import { BudgetCard } from "@/features/kudo/components/budget-card";
import { SendKudoForm } from "@/features/kudo/components/send-kudo-form";
import { FeedList } from "@/features/feed/components/feed-list";
import { AppShell } from "@/components/app-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <AppShell active="feed">
      <section className="hero">
        <div>
          <Eyebrow>Team recognition</Eyebrow>
          <Heading as="h1">Celebrate work that matters.</Heading>
          <Text>Make great contributions visible and help appreciation travel further.</Text>
        </div>
        <BudgetCard />
      </section>
      <div className="columns">
        <section>
          <SendKudoForm />
        </section>
        <section id="feed">
          <SectionHeading eyebrow="Latest activity" title="Recognition feed" />
          <FeedList />
        </section>
      </div>
    </AppShell>
  );
}
