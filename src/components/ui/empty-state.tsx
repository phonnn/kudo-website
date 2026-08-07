import type { HTMLAttributes } from "react";
import { Surface } from "./surface";

export function EmptyState({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <Surface className={["empty", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Surface>
  );
}
