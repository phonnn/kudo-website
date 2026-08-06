import { BudgetCard } from "@/features/kudo/components/budget-card";
import { SendKudoForm } from "@/features/kudo/components/send-kudo-form";
import { FeedList } from "@/features/feed/components/feed-list";

export default function Home() {
  return <><header><a className="brand" href="#"><span>GJ</span>Good Job</a><nav><a className="active" href="#feed">Feed</a><a href="#rewards">Rewards</a></nav><button className="profile" aria-label="Profile">AM</button></header><main><section className="hero"><div><div className="eyebrow">Team recognition</div><h1>Celebrate work that matters.</h1><p>Make great contributions visible and help appreciation travel further.</p></div><BudgetCard /></section><div className="columns"><section><SendKudoForm /></section><section id="feed"><div className="section-title"><div><div className="eyebrow">Latest activity</div><h2>Recognition feed</h2></div></div><FeedList /></section></div></main><footer>Good Job · Built for better teams</footer></>;
}
