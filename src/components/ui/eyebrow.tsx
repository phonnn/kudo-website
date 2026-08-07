import type { HTMLAttributes, ReactNode } from "react";

interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Eyebrow({ className, ...props }: EyebrowProps) {
  const classes = ["eyebrow", className].filter(Boolean).join(" ");

  return <div className={classes} {...props} />;
}
