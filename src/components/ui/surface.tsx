import type { HTMLAttributes, ReactNode } from "react";

type SurfaceElement = "div" | "section" | "article" | "aside";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceElement;
  children: ReactNode;
}

export function Surface({ as: Element = "div", className, ...props }: SurfaceProps) {
  const classes = ["card", className].filter(Boolean).join(" ");

  return <Element className={classes} {...props} />;
}
