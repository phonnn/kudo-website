import type { HTMLAttributes, ReactNode } from "react";

type TextElement = "p" | "span" | "small" | "strong" | "b" | "div";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextElement;
  children: ReactNode;
}

export function Text({ as: Element = "p", className, ...props }: TextProps) {
  const classes = ["ui-text", className].filter(Boolean).join(" ");

  return <Element className={classes} {...props} />;
}
