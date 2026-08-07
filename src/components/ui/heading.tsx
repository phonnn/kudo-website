import type { HTMLAttributes, ReactNode } from "react";

type HeadingElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingElement;
  children: ReactNode;
}

export function Heading({ as: Element = "h2", className, ...props }: HeadingProps) {
  const classes = ["ui-heading", className].filter(Boolean).join(" ");

  return <Element className={classes} {...props} />;
}
