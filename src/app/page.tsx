import { BudgetCard } from "@/features/kudo/components/budget-card";
import { SendKudoForm } from "@/features/kudo/components/send-kudo-form";
import { FeedList } from "@/features/feed/components/feed-list";
import { AppHeader } from "@/components/app-header";

export default function Home() {
  return <><AppHeader active="feed" /><main><section className="hero"><div><div className="eyebrow">Team recognition</div><h1>Celebrate work that matters.</h1><p>Make great contributions visible and help appreciation travel further.</p></div><BudgetCard /></section><div className="columns"><section><SendKudoForm /></section><section id="feed"><div className="section-title"><div><div className="eyebrow">Latest activity</div><h2>Recognition feed</h2></div></div><FeedList /></section></div></main><footer>Good Job · Built for better teams</footer></>;
}
