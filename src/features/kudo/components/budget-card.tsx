"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/app-providers";

export function BudgetCard() {
  const api = useApi();
  const budget = useQuery({ queryKey: ["budget"], queryFn: () => api.getBudget() });
  const percent = budget.data ? (budget.data.remaining / budget.data.total) * 100 : 0;
  return <aside className="card budget"><div className="eyebrow">Monthly giving budget</div><div className="budget-number">{budget.data?.remaining ?? "—"}<span> points left</span></div><div className="track"><div style={{ width: `${percent}%` }} /></div><small>Resets at the start of next month</small></aside>;
}
