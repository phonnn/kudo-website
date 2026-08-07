"use client";

import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/providers/app-providers";
import { Surface } from "@/components/ui/surface";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Text } from "@/components/ui/text";

export function BudgetCard() {
  const api = useApi();
  const budget = useQuery({ queryKey: ["budget"], queryFn: () => api.getBudget() });
  let percent = 0;

  if (budget.data) {
    percent = (budget.data.remaining / budget.data.total) * 100;
  }
  return (
    <Surface as="aside" className="budget">
      <Eyebrow>Monthly giving budget</Eyebrow>
      <div className="budget-number">
        {budget.data?.remaining ?? "—"}
        <Text as="span"> points left</Text>
      </div>
      <div className="track">
        <div style={{ width: `${percent}%` }} />
      </div>
      <Text as="small">Resets at the start of next month</Text>
    </Surface>
  );
}
